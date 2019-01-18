var si = new Vue({
  // 要素選択
  el: '#si',
  // 設定するデータ
  data: {
    uploadedImage: '',
  },
  // 画像を選択したときの処理
  methods: {
    // 画像が変更されたとき
    onFileChange: function(e) {
      // Promiseによる同期処理
      Promise.resolve(e.target.files[0])
        .then(this.createImage)     // 画像表示
        .then(this.to64)            // 画像をエンコード
        .then(this.cloudVision)     // 画像解析
        .then(res => {
          console.log("成功");
        })
    },

    // 画像読み込み
    createImage: function(file) {
      console.log("最初の引数", file);
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (e) => {
          // v-show要素に画像をセット
          this.uploadedImage = e.target.result;
        };
        reader.readAsDataURL(file);
        resolve(file);
      })
    },

    // 画像をBase64形式に変換
    to64: function(file){
      console.log("createImageから", file);
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        // ファイル読み込んだとき
        reader.onload = (ev) => {
          // console.log("変換前", ev.target.result);
          // console.log("結果", ev.target.result.replace(/^data:image\/(png|jpeg);base64,/, ''));
          // 先頭のメタデータを削除
          resolve(ev.target.result.replace(/^data:image\/(png|jpeg);base64,/, ''));
        }
        reader.readAsDataURL(file);
      })
    },

    // CloudVisionによる画像解析
    cloudVision: function(base64string) {
      console.log("to64から", base64string);
      return new Promise((resolve, reject) => {
        let encoded_image = base64string;
        let url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCzjA9cgXh6ocrszJmBQaTS32e1xExwD0E'
        // APIアクセス
        axios.post(url, {
          requests: [
            {
              image: {content: encoded_image},
              features: [{type: 'LABEL_DETECTION'}]
            }
          ]
        },
        {
          headers: {'Content-Type': 'application/json'}
        }
        )
        // 成功時
        .then(function(response){
          console.log('body:', response.data);
          let labelList = response.data.responses[0].labelAnnotations;
          for(let i = 0; i < 10; i++){
            document.getElementById("img_tbl").innerText += labelList[i].description + "\n";
          }

          resolve(response.data);
        }.bind())
        // エラー時
        .catch(function(error){
          console.log(error);
        });
      })
    },

  }
})
