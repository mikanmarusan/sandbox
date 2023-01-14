// URLから検索クエリ（p）を取得（ここではpとする）
let params = new URLSearchParams(window.location.search.substring(1));
let query = params.get("p"); 

// 本来はここでクエリの意図解析をし、言語モデルに投げるかどうかを決める
// Do Nothing ...

// OpenAIのCompletionへ投げる
// https://api.openai.com/v1/completions
fetch('https://api.openai.com/v1/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: "text-davinci-003",
    prompt: query,
    max_tokens: 1024,
    temperature: 0.5
}),
  headers: {
    'Content-type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer {YOUR_API_KEY}' 
  },
})
  .then((response) => response.json())
  .then((json) => {
    let desc = json["choices"][0]["text"];
    window.alert(desc); 
  })
  .catch((err) => window.alert("error"));
