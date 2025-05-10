export function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // 헤더 추가
  csvRows.push(headers.join(","));

  // 데이터 추가
  for (const row of data) {
    const values = headers.map((header) => {
      let value = row[header];

      // 날짜는 다른 방식으로 처리한다
      if (header === "created_at") {
        value = new Date(value + 9 * 60 * 60 * 1000)
          .toISOString()
          .replace("T", " ")
          .replace("Z", "");
      }
      // Object라면 JSON.stringify 한다
      if (value && (typeof value === "object" || Array.isArray(value))) {
        value = `"${JSON.stringify(value).replaceAll('"', '""')}"`;
      }
      // 쉼표가 있다면 처리
      if (value && typeof value === "string" && value.includes(",")) {
        value = `"${value}"`;
      }

      return value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export function downloadCSV(csvData: string, fileName: string): void {
  const now = new Date();
  const filename = `${fileName}_${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}.csv`;
  // BOM 추가
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob); // window.URL 대신 URL을 사용
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  a.click();
  URL.revokeObjectURL(url);
}
