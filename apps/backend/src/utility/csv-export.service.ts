import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { format } from "@fast-csv/format";
import QueryStream from "pg-query-stream";
import pg from "pg";

@Injectable()
export class CsvExportService {
  /**
   * PostgreSQL 쿼리 결과를 CSV로 스트리밍하는 헬퍼 함수
   * @param res Express Response
   * @param client pg.PoolClient (PG 풀에서 얻은 연결)
   * @param sql 실행할 SQL 쿼리
   * @param filename 다운로드할 파일명 (기본: data.csv)
   * @param headers CSV 헤더 포함 여부 (기본: true)
   */
  async streamQueryToCsv(
    res: Response,
    client: pg.PoolClient,
    sql: string,
    filename = "data.csv",
    headers = true,
  ): Promise<void> {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // UTF-8 BOM 추가
    res.write("\ufeff");

    try {
      // highWaterMark: 동시에 처리하는 row의 개수
      const queryStream = new QueryStream(sql, undefined, { highWaterMark: 10000 });
      const dbStream = client.query(queryStream);
      const csvStream = format({ headers });

      dbStream.pipe(csvStream).pipe(res);

      // 스트림 종료시 연결 해제
      csvStream.on("end", () => {
        client.release();
      });

      dbStream.on("error", (err) => {
        console.error("DB 스트림 에러:", err);
        res.status(500).end("데이터 스트리밍 중 에러 발생");
        client.release();
      });
    } catch (error) {
      console.error("CSV 스트리밍 처리 중 에러:", error);
      res.status(500).end("서버 에러");
      client.release();
    }
  }
}
