"use strict";
const BrowserAmountProbe = (() => {
    function gaussian(data, width, height, sigma) {
        const radius = Math.round(sigma * 4);
        const weights = Array.from({length: radius * 2 + 1}, (_, i) =>
            Math.exp(-((i - radius) ** 2) / (2 * sigma ** 2)));
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        function reflected(index, size) {
            const period = size * 2;
            const within = ((index % period) + period) % period;
            return within < size ? within : period - within - 1;
        }
        function pass(source, horizontal) {
            const output = new Float64Array(source.length);
            for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
                let sum = 0;
                for (let offset = -radius; offset <= radius; offset++) {
                    const ix = horizontal ? reflected(x + offset, width) : x;
                    const iy = horizontal ? y : reflected(y + offset, height);
                    sum += source[iy * width + ix] * weights[offset + radius];
                }
                output[y * width + x] = sum / total;
            }
            return output;
        }
        return pass(pass(data, false), true);
    }

    function readGray(context, left, top, width, height) {
        const {data} = context.getImageData(left, top, width, height);
        return Float64Array.from({length: width * height}, (_, index) => data[index * 4]);
    }

    function median(values) {
        const sorted = [...values].sort((a,b) => a-b);
        return (sorted[Math.floor((sorted.length-1)/2)] + sorted[Math.floor(sorted.length/2)])/2;
    }

    function center(word) { return (word.y0+word.y1)/2; }

    function amountColumn(context, lines) {
        const width = context.canvas.width, height = context.canvas.height;
        const isAmount = word => /^[—-]?[¥\\][0-9][0-9,]*[)-]?$/.test(word.text);
        const amounts = lines.flat().filter(isAmount);
        const bands = amounts.map(word => amounts.filter(other => Math.abs(word.x1-other.x1)<=width*.012));
        bands.sort((a,b) => b.length-a.length);
        const anchors = bands[0] || [];
        if (anchors.length<3 || bands.some(b => b.length===anchors.length && !b.some(w=>anchors.includes(w)))) return [];
        const right = Math.round(median(anchors.map(w=>w.x1)));
        const charHeight = Math.round(median(anchors.map(w=>w.y1-w.y0)));
        const start = Math.min(...anchors.map(center));
        const top = Math.max(0,Math.min(...anchors.map(w=>w.y0))-3*charHeight);
        const bottom = Math.min(height,Math.max(...anchors.map(w=>w.y1))+charHeight);
        return {right,charHeight,start,top,bottom,width};
    }

    function selectSlots(context, {right,charHeight,top,bottom,width}, present, missing) {
        if (!missing.length) return [];
        const close = (y, values) => values.some(value=>Math.abs(value-y)<.43*charHeight);
        const slots = new Map();
        for (const [widthScale, threshold, gap] of [[1.05,2.5,3],[.7,3.5,1]]) {
            const left = right-Math.round(widthScale*charHeight);
            const stripWidth = right+4-left, stripHeight = bottom-top;
            if (left<0 || right+4>width || stripHeight<1) continue;
            const gray = readGray(context,left,top,stripWidth,stripHeight);
            const blurred = gaussian(gray,stripWidth,stripHeight,5);
            const ink = new Float64Array(stripHeight);
            for (let i=0;i<gray.length;i++) if (blurred[i]-gray[i]>23) ink[Math.floor(i/stripWidth)]++;
            const signal = gaussian(ink,1,stripHeight,1);
            let begin = -1, end = -1;
            function record() {
                const size = end-begin+1;
                if (begin<gap || end>=stripHeight-gap || size<charHeight*.35 || size>charHeight*1.15) return;
                const y = top+(begin+end+1)/2;
                if (!close(y,missing) || close(y,present)) return;
                const slot = {top:top+begin,end:top+end+1,right,charHeight};
                slots.set(slot.top+':'+slot.end,slot);
            }
            for (let i=0;i<signal.length;i++) if (signal[i]>=threshold) {
                if (i-end>2*gap+1 && begin>=0) { record(); begin=-1; }
                if (begin<0) begin=i;
                end=i;
            }
            if (begin>=0) record();
        }
        return slots.size<=6 ? [...slots.values()].sort((a,b)=>a.top-b.top) : [];
    }

    function cropForOcr(context, slot, widthScale, sigma) {
        const top = Math.max(0,slot.top-5), bottom = Math.min(context.canvas.height,slot.end+5);
        const left = Math.max(0,slot.right-Math.round(slot.charHeight*widthScale));
        const right = Math.min(context.canvas.width,slot.right+12);
        const width = right-left, height = bottom-top, border = 16;
        const gray = readGray(context,left,top,width,height);
        const blurred = sigma ? gaussian(gray,width,height,sigma) : null;
        const canvas = document.createElement("canvas");
        canvas.width=width+2*border; canvas.height=height+2*border;
        const target=canvas.getContext("2d"), output=target.createImageData(canvas.width,canvas.height);
        output.data.fill(255);
        for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
            const i=y*width+x;
            const value=Math.max(0,Math.min(255,Math.floor(blurred ? 245+3.2*(gray[i]-blurred[i]) : gray[i])));
            const dest=((y+border)*canvas.width+x+border)*4;
            output.data[dest]=output.data[dest+1]=output.data[dest+2]=value;
        }
        target.putImageData(output,0,0);
        return canvas;
    }

    async function retryWithDeadline(primary, scan, timeout, controller = new AbortController()) {
        const {signal} = controller;
        if (signal.aborted || timeout <= 0) return primary;
        let timer, cancel;
        try {
            return await Promise.race([
                new Promise(resolve => {
                    cancel = () => resolve(primary);
                    signal.addEventListener("abort", cancel, {once: true});
                    timer = setTimeout(() => controller.abort(), timeout);
                }),
                Promise.resolve().then(() => signal.aborted ? primary : scan(signal)).catch(() => primary)
            ]);
        } finally {
            clearTimeout(timer);
            signal.removeEventListener("abort", cancel);
        }
    }

    return {amountColumn,selectSlots,cropForOcr,retryWithDeadline,median,readGray};
})();
