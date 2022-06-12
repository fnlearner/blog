---
title: 图片格式转换
date: 2022-06-12 14:00:10
tags: 
    - javascript
top: 1
---
<html>
<body>
    <input id="upload-input" type="file" accept="image/*" onchange="handleUpload()">
    选择要转换的格式
    <select id="format-select"  onchange="handleChange()">
        <option value="webp">
            webp
        </option>
        <option value="png">
            png
        </option>
        <option value="jpeg">
            jpg
        </option>
    </select>
    <button onclick="submit()">格式转换</button>
    <!-- <canvas id="canvas" width="200" height="200"></canvas> -->

</body>


<script type="text/javascript">
    const param = {
        files:null,
        format:'webp'
    };
 


    function handleUpload(){
        const inputValue = document.getElementById('upload-input')
        param.files = inputValue.files
    };
    function handleChange(){
        const selectElement = document.getElementById('format-select')
        const selectedIndex = selectElement.selectedIndex
        const optionValue = selectElement.options[selectedIndex].value
        param.format = optionValue    
    };


    function submit(){
        if(!param.files) {
            window.alert('还没有选择文件')
            return
        }
        const image = new Image()
        const reader = new FileReader()
        for(const item of param.files){
            // const name = item.name  
            // console.info(item) 
            reader.readAsDataURL(item)
            reader.onload = (data)=>{
                const currentTarget = data.currentTarget
                const result = currentTarget.result
                image.crossOrigin = 'anonymous'
                image.src = result
                image.onload = (img)=>{
                    const canvas = document.createElement('canvas')
                    canvas.height = image.height
                    canvas.width = image.width
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(image,0,0)
                    const format = `image/${param.format}`
                    const url =  canvas.toDataURL(format)  
                   
                    
                    const a = document.createElement('a')
                    a.download = Date.now() 
                    a.href = url
                   
                    a.click()
              
                }
            }
            
        }
    }
        
</script>

</html>


