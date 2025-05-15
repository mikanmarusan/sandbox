import requests
import json
from datetime import datetime, timedelta
import time

# APIのエンドポイント
url = 'https://disclosure.edinet-fsa.go.jp/api/v2/documents.json'
api_key = "key"

# 今日の日付
end_date = datetime.today()
# 1年前の日付
#start_date = end_date - timedelta(days=365)
start_date = end_date - timedelta(days=5)

current_date = start_date
pdfs = {}

while current_date <= end_date:
    date_str = current_date.strftime('%Y-%m-%d')

    # パラメータの設定（元コードのまま）
    params = {
        'date': date_str,
        'type': 2,  # 2は有価証券報告書などの決算書類
        "Subscription-Key": api_key
    }

    # APIリクエストを送信
    response = requests.get(url, params=params)
    print(date_str)

    # レスポンスのJSONデータを取得
    data = response.json()
    for item in data.get('results', []):
      sec_code = item.get('secCode')
      if sec_code and len(sec_code) == 5 and sec_code.endswith('0'):
        sec_code = sec_code[:-1]  # 末尾の0を削除して4桁にする
      doc_type_code = item.get('docTypeCode')

      if sec_code is not None and doc_type_code == '120':
        pdfs[sec_code] = "https://disclosure2dl.edinet-fsa.go.jp/searchdocument/pdf/" + item.get('docID') + ".pdf"
        print(sec_code + " " +  "https://disclosure2dl.edinet-fsa.go.jp/searchdocument/pdf/" + item.get('docID') + ".pdf")

    time.sleep(1)
    current_date += timedelta(days=1)


print(pdfs)
sorted_keys = sorted(pdfs)
sorted_pdfs_by_key = {k: pdfs[k] for k in sorted_keys}
print(sorted_pdfs_by_key)
