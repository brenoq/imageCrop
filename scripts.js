const photoFile = document.getElementById("photo-file");
let photoPreview = document.getElementById("photo-preview");
let image;
let photoName;

// Select & Preview image

document.getElementById("select-image")
.onclick = function() {
  photoFile.click();
}

window.addEventListener("DOMContentLoaded", () => {
  photoFile.addEventListener("change", () => {
    let file = photoFile.files.item(0);
    photoName = file.name;
    
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      image = new Image();
      image.src = event.target.result
      image.onload = onLoadImage;
    }
  })
})

// Selection Tool

const selection = document.getElementById("selection-tool");

let startX, startY, relativeStartX, relativeStartY,
endX, endY, relativeEndX, relativeEndY;

let startSelection = false;

const events = {
  mouseover(){
    this.style.cursor = "crosshair";
  },
  mousedown(){
    const { pageX, pageY, offsetX, offsetY } = event;

    if (selection.style.display == "initial") {
      selection.style.display = "none";
    }

    startX = pageX;
    startY = pageY;
    relativeStartX = offsetX;
    relativeStartY = offsetY;

    startSelection = true;
  },
  mousemove(){
    endX = event.pageX;
    endY = event.pageY;

    if (startSelection) {
      selection.style.display = "initial"
      selection.style.top = startY+ "px"
      selection.style.left = startX + "px"

      selection.style.width = (endX - startX) + "px";
      selection.style.height = (endY - startY) + "px";
    } 
  },
  mouseup(){
    startSelection = false;

    relativeEndX = event.layerX;
    relativeEndY = event.layerY;

    cropButton.style.display = "initial";
  },
}

Object.keys(events)
.forEach((eventName) => {
  photoPreview.addEventListener(eventName, events[eventName]);
  selection.addEventListener(eventName, events[eventName]);
})

// Canvas

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function onLoadImage() {
const { width, height } = image;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  
  ctx.drawImage(image, 0, 0);

  photoPreview.src = canvas.toDataURL()
};

// Cortar Imagem

const cropButton = document.getElementById("crop-image");

cropButton.onclick = () => {
  const { width: imageW, height: imageH } = image;
  const { width: previewW, height: previewH } = photoPreview;

  const [ widthFactor, heightFactor ] = [
    +(imageW / previewW),
    +(imageH / previewH)
  ];

  const [ selectionWidth, selectionHeight ] = [
    +selection.style.width.replace("px", ""),
    +selection.style.height.replace("px", "")
  ];

  const [ croppedWidth, croppedHeight ] = [
    +(selectionWidth * widthFactor),
    +(selectionHeight * heightFactor)
  ];

  const [ actualX, actualY ] = [
    +(relativeStartX * widthFactor),
    +(relativeStartY * heightFactor)
  ];

  // Pegar do ctx a imagem cortada

  const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight);

  // Limpar o ctx

  ctx.clearRect(0, 0, ctx.width, ctx.height);

  // Ajuste de proporções

  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  // Adicionar a imagem cortada ao ctx

  ctx.putImageData(croppedImage,0, 0);

  //Esconder a ferramenta de seleção

  selection.style.display = "none";

  // Atualizar o preview da imagem

  photoPreview.src = canvas.toDataURL();

  // Mostrar o botão download

  downloadButton.style.display = "initial";

}

// Download de imagem

const downloadButton = document.getElementById("download");
downloadButton.onclick = () => {
  const a = document.createElement("a");
  a.download = photoName + "-cropped.png"
  a.href = canvas.toDataURL();
  a.click()
}
