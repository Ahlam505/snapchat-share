const Vibrant = require("node-vibrant");
const trianglify = require('trianglify')

/**
 * Generates and displays an image that matches the description
 * in the README file. Can eaily be modified to return the canvas 
 * or it's PNG equivalent.
 * @param {number} width - value in pixels; can pass viewer width if desired
 * @param {number} height - value in pixels; can pass viewer height if desired
 * @param {string} url - the location of the image, either locally or online
 * @param {string} bigText - larger text; optional parameter
 * @param {string} smallText - smaller text; required if big text used
 * @returns {element} canvas - the generated image on a canvas
 */
async function getShareImage(width, height, url, bigText, smallText) {
  const palette = await Vibrant.from(url).getPalette(async (err, palette) => {
    if (err) return console.error("Error getting share image:", err);
    return palette;
  });

  if (!palette) return undefined;
  const colors = await getColors(palette);
  const canvas = await createCanvas(width, height, colors);

  let imageSize = width / 2;
  let imageX = (width / 2) - (imageSize / 2);
  let imageY = (height / 2) - (imageSize / 2);
  if (!!bigText) imageY *= .65; // If there's text, move the image up
  let ctx = canvas.getContext("2d");

  // https://stackoverflow.com/a/46639473/6456163
  return new Promise(resolve => {
    // https://stackoverflow.com/a/30517793/6456163
    base_image = new Image();
    base_image.crossOrigin = "anonymous";
    base_image.onerror = () => console.error(`${url} failed to load!`);
    base_image.onload = () => {
      // Add image
      ctx.drawImage(base_image, imageX, imageY, imageSize, imageSize);

      // Add text if applicable
      if (bigText) {
        let textY = (height / 2) + 50;
        let font = "Alata";
        ctx.font = `24px ${font}`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(bigText, width / 2, textY);

        if (smallText) {
          // TODO: See if I can set a width wrap for this, %-wise
          ctx.font = `18px ${font}`;
          ctx.fillStyle = "#A9A9A9";
          ctx.fillText(smallText, width / 2, textY + 25);
        }
      }

      resolve(canvas);
    }
    base_image.src = url;
  });
}

async function getColors(palette) {
  let colors = [];
  let i = 0;
  for (const swatch in palette) {
    // Adds the even numbered swatches, which are typically
    // vibrant, dark vibrant, and light vibrant/muted
    let rgb = palette[swatch]._rgb.map(x => Math.round(x))
    let color = `rgb(${rgb.toString()})`;
    if (i % 2) colors.push(color);
    i++;
  }

  return colors;
}

async function createCanvas(width, height, colors) {
  const canvas = trianglify({
    width: width,
    height: height,
    cellSize: 50,
    variance: 1.0,
    xColors: colors
  }).toCanvas();
  
  return canvas;
}

module.exports = { getShareImage };