/**
 * EDINET API v2を使用して、指定期間の有価証券報告書を取得する
 *
 */
function fetchEdinetFinancialReports() {

  var apiUrl = 'https://disclosure.edinet-fsa.go.jp/api/v2/documents.json';
  var apiKey = PropertiesService.getScriptProperties().getProperty('EDINET_API_KEY');

  if (apiKey === "" || apiKey === null) {
    Logger.error("faild to get EDINET API Key");
    throw new Error("faild to get EDINET API Key");
  }

  // 日付範囲の設定
  var today = new Date(); // 現在の日時
  var endDate = new Date(today.getTime()); // ループの終了日（今日）

  // Pythonの timedelta(days=366) に相当。開始日は終了日の365日前。
  var startDate = new Date(today.getTime());
  //startDate.setDate(today.getDate() - 366);
  startDate.setDate(today.getDate() - 5);

  Logger.info("begin to search resources from " +
             Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') +
             " to " +
             Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'));

  var currentDate = new Date(startDate.getTime()); // ループ用の現在日付（開始日からスタート）
  var collectedPdfs = {}; // 取得したPDFのURLを格納するオブジェクト (キー: 証券コード)
  var collectedFilerName = {}; // 取得した会社名を格納するオブジェクト (キー: 証券コード)

  // currentDateがendDateに達するまでループ (時刻も比較対象)
  while (currentDate.getTime() <= endDate.getTime()) {
    var dateString = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    Logger.log("searching resources on "  + dateString + " ...");

    // APIリクエストのパラメータ
    var queryParams = {
      'date': dateString,
      'type': 2,  // 提出書類一覧APIの「type=2」は決算短信、有価証券報告書等の開示書類が対象
      'Subscription-Key': apiKey
    };

    // クエリ文字列を生成
    var queryString = Object.keys(queryParams)
      .map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]);
      })
      .join('&');

    var requestUrl = apiUrl + '?' + queryString;

    var fetchOptions = {
      'method': 'get',
      'contentType': 'application/json',
      'muteHttpExceptions': true
    };

    try {
      var response = UrlFetchApp.fetch(requestUrl, fetchOptions);
      var responseCode = response.getResponseCode();
      var responseBody = response.getContentText();

      if (responseCode === 200) {
        var jsonData = JSON.parse(responseBody);
        var documents = jsonData.results || []; // 'results' プロパティが存在しない場合は空配列

        documents.forEach(function(doc) {
          var securityCode = doc.secCode;    // 証券コード (例: "13010")
          var docTypeCode = doc.docTypeCode; // 書類種別コード (例: "120" は有価証券報告書)
          var documentId = doc.docID;        // 書類管理番号
          var filerName = doc.filerName;     // 

          // 証券コードの処理: 5桁で末尾が '0' の場合、末尾の '0' を除去 (例: "13010" -> "1301")
          if (securityCode && typeof securityCode === 'string' && securityCode.length === 5 && securityCode.endsWith('0')) {
            securityCode = securityCode.slice(0, -1);
          }

          // 有価証券報告書 (docTypeCode '120') のみ対象
          if (securityCode && docTypeCode === '120' && documentId) {
            var pdfUrl = `https://disclosure2dl.edinet-fsa.go.jp/searchdocument/pdf/${documentId}.pdf`;
            collectedPdfs[securityCode] = pdfUrl;
            collectedFilerName[securityCode] = filerName;
            Logger.log(securityCode + ": " + pdfUrl);
          }
        });
      } else {
        Logger.warn("failed to get data " + dateString);
      }
    } catch (error) {
      Logger.error(error.message + "\n stacktrace: " + error.stack);
    }

    // APIへの負荷を考慮し、1秒待機 (EDINET APIの利用規約に従ってください)
    Utilities.sleep(1000);

    // 日付を1日進める
    currentDate.setDate(currentDate.getDate() + 1);
  }

  Logger.info("end to search resources");

  var thisSpreadsheet = SpreadsheetApp.openById("1lB_oDt51M5Rm5lJHkWdTr-rWWLxqG5RAETNOd2encrg");
  var sheet = thisSpreadsheet.getSheetByName("Lists");
  if (sheet) {
    var row = sheet.getLastRow() + 1; // 最終行の次から書き出し (ヘッダーがある場合は調整)

    var writeDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    for (var code in collectedPdfs) {
      if (collectedPdfs.hasOwnProperty(code)) {
        sheet.getRange(row, 1).setValue(code);      // 証券コード
        sheet.getRange(row, 2).setValue(collectedFilerName[code])
        sheet.getRange(row, 3).setValue(collectedPdfs[code]); // PDF URL
        sheet.getRange(row, 4).setValue(`https://finance.yahoo.co.jp/quote/${code}.T`);
        sheet.getRange(row, 5).setValue(writeDate); // 取得日時
        row++;
      }
    }
    Logger.info("wrote resouces to the sheet of " + sheet.getName());
  } else {
    Logger.warn(sheet.getName() + "No such sheet");
  }
}

