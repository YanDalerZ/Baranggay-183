import { Request, Response } from 'express';
import pool from '../database/db.js';
import { RowDataPacket } from 'mysql2';

interface AivenAPIResponse {
    service: {
        state: string;
        plan: string;
        disk_space_mb: number;
        disk_space_used_mb?: number;
        memory_mb: number;
        cpu: number;
        create_time: string;
        node_count: number;
        backup_enabled: boolean;
    };
}

class DatabaseController {
    public async getAivenStatus(req: Request, res: Response): Promise<any> {
        const AIVEN_PROJECT = "naap-commisions";
        const AIVEN_SERVICE = "baranggay183";
        const targetUrl = `https://api.aiven.io/v1/project/${AIVEN_PROJECT}/service/${AIVEN_SERVICE}`;
        const token = process.env.AIVEN_API_TOKEN;

        try {
            // 1. Fetch Infrastructure Metrics from Aiven API
            let cloudMetrics = {
                state: "UNKNOWN",
                plan: "N/A",
                disk_total_mb: 0,
                disk_used_mb: 0,
                memory_mb: 0,
                cpu: 0,
                nodes: 0,
                created_at: "",
                backup_enabled: false
            };

            if (!token) {
                console.warn("⚠️ AIVEN_API_TOKEN is missing from environmental setup parameters.");
            } else {
                try {
                    const response = await fetch(targetUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token.trim()}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = (await response.json()) as AivenAPIResponse;
                        cloudMetrics = {
                            state: data.service.state,
                            plan: data.service.plan,
                            disk_total_mb: data.service.disk_space_mb,
                            disk_used_mb: data.service.disk_space_used_mb || 0,
                            memory_mb: data.service.memory_mb || 0,
                            cpu: data.service.cpu || 0,
                            nodes: data.service.node_count,
                            created_at: data.service.create_time,
                            backup_enabled: data.service.backup_enabled
                        };
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error(`❌ Aiven API Error [${response.status}]:`, errorData);
                    }
                } catch (fetchErr) {
                    console.error("❌ Failed connecting to external Aiven cloud endpoint infrastructure:", fetchErr);
                }
            }

            // 2. Fetch Statistics directly from SQL Engine Instance Connection Pool
            let queryStats: any[] = [];
            let tableStats: any[] = [];

            try {
                const connection = await pool.getConnection();

                // --- Part A: Internal Table Allocation Footprint ---
                try {
                    const [tables] = await connection.execute<RowDataPacket[]>(
                        `SELECT 
                            TABLE_NAME as table_name, 
                            COALESCE(TABLE_ROWS, 0) AS table_rows, 
                            ROUND(COALESCE(DATA_LENGTH + INDEX_LENGTH, 0) / 1024 / 1024, 2) AS size_mb 
                         FROM information_schema.tables 
                         WHERE table_schema = ? 
                         ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC`,
                        [process.env.DB_NAME || 'defaultdb']
                    );
                    tableStats = tables;
                } catch (dbErr) {
                    console.warn("⚠️ Could not fetch table schema internal metrics safely:", dbErr);
                }

                // --- Part B: Slow Engine Query Analytical Profiler ---
                try {
                    const [slowQueries] = await connection.execute<RowDataPacket[]>(
                        `SELECT 
                            query, 
                            ROUND(avg_latency / 1000000) AS avg_latency, 
                            exec_count 
                         FROM sys.statement_analysis 
                         WHERE query NOT LIKE '%statement_analysis%'
                         ORDER BY avg_latency DESC 
                         LIMIT 5`
                    );
                    queryStats = slowQueries;
                } catch (sysErr) {
                    console.warn("⚠️ Skipping performance schema views query execution trace: Permissions restricted.");
                    queryStats = [];
                }

                connection.release();
            } catch (poolErr) {
                console.error("❌ Critical engine connection loss to local connection pool management instance:", poolErr);
            }

            // 3. Construct Unified Payload Response
            return res.status(200).json({
                ...cloudMetrics,
                query_performance: queryStats,
                database_tables: tableStats
            });

        } catch (error: any) {
            console.error("❌ Internal Backend Controller Exception:", error);
            return res.status(500).json({
                error: 'Failed to communicate with Aiven or Database',
                details: error.message || error
            });
        }
    }
}

export default new DatabaseController();