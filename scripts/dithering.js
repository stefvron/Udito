export async function floydSteinberg(canvas, colourComparison, errFac) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const i = y * (imageData.width * 4) + x * 4;
            const oldpixel = [data[i],data[i+1],data[i+2]]
            let newpixel = await colourComparison([...oldpixel]);

            data[i] = newpixel[0]; // red
            data[i + 1] = newpixel[1]; // green
            data[i + 2] = newpixel[2]; // blue

            const quantError = [(oldpixel[0] - newpixel[0]), (oldpixel[1] - newpixel[1]), (oldpixel[2] - newpixel[2])];
            
            const offsets = [[1,0],[-1,1],[0,1],[1,1]];
            const fact = [(7/16),(3/16),(5/16),(1/16)];
            for(let o = 0; o < offsets.length; o++) {
                const c = (y+offsets[o][1]) * (imageData.width * 4) + (x+offsets[o][0]) * 4;
                data[c] += (quantError[0] * fact[o] * errFac); // red
                data[c + 1] += (quantError[1] * fact[o] * errFac); // green
                data[c + 2] += (quantError[2] * fact[o] * errFac); // blue
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

export async function atkinson(canvas, colourComparison, errFac) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for(let y = 0; y < imageData.height; y++) {
        for(let x = 0; x < imageData.width; x++) {
            const i = y * (imageData.width * 4) + x * 4;
            const oldpixel = [data[i],data[i+1],data[i+2]]
            let newpixel = await colourComparison([...oldpixel]);

            data[i] = newpixel[0]; // red
            data[i + 1] = newpixel[1]; // green
            data[i + 2] = newpixel[2]; // blue

            const quantError = [(oldpixel[0] - newpixel[0]), (oldpixel[1] - newpixel[1]), (oldpixel[2] - newpixel[2])];
            
            const offsets = [[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]];
            const fact = [(1/8),(1/8),(1/8),(1/8),(1/8),(1/8)];
            for(let o = 0; o < offsets.length; o++) {
                const c = (y+offsets[o][1]) * (imageData.width * 4) + (x+offsets[o][0]) * 4;
                data[c] += (quantError[0] * fact[o] * errFac); // red
                data[c + 1] += (quantError[1] * fact[o] * errFac); // green
                data[c + 2] += (quantError[2] * fact[o] * errFac); // blue
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
