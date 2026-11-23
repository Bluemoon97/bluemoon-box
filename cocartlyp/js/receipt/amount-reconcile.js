"use strict";
const BrowserReceiptReconcile = (() => {
    const tolerance = charHeight => .43*charHeight;
    const slotCenter = slot => (slot.top+slot.end)/2;
    function moneyOnLine(line) {
        const subtotal = /^小\s*計(?:\s|$)/.test(line.map(word=>word.text).join(" "));
        return line.flatMap((word,index) => {
            let {text,x1}=word;
            const next=line[index+1];
            if (/^[¥\\]\d{1,3},$/.test(text) && next && /^\d{3}\)?$/.test(next.text) &&
                Math.abs(word.y0-next.y0)<10 && next.x0>=x1 && next.x0-x1<35) {
                text+=next.text;
                x1=next.x1;
            }
            const match=/^[—-]?[¥\\](\d+|\d{1,3}(?:,\d{3})+)[)-]?$/.exec(text);
            const subtotalMatch=subtotal && index===line.length-1
                ? /^(\d{1,3}(?:,\d{3})+|\d+)[。.]?$/.exec(text) : null;
            const token=match || subtotalMatch;
            const amount=token ? Number(token[1].replaceAll(",","")) : 0;
            return Number.isSafeInteger(amount) && amount>0
                ? [{amount,x1,y:(word.y0+word.y1)/2,source:"primary",summaryOnly:subtotal}] : [];
        });
    }

    function divider(context, column, previous, subtotal) {
        const margin=Math.ceil(column.right*.05)+7;
        const left=Math.round(column.right*.43), width=Math.round(column.right)-left;
        const top=Math.round(previous.y+column.charHeight*.45);
        const bottom=Math.round(subtotal.y-column.charHeight*.45);
        if (bottom-top<8 || width<150 || top<margin || bottom+margin>context.canvas.height) return false;
        const gray=BrowserAmountProbe.readGray(context,left,top-margin,width,bottom-top+margin*2);
        for (let rotation=-9;rotation<=9;rotation++) {
            const offsets=Array.from({length:width},(_,x)=>Math.round((x-(width-1)/2)*rotation*.005));
            for (let y=margin;y<bottom-top+margin;y++) {
                const regions=new Uint16Array(8);
                for (let x=0;x<width;x++) {
                    const i=(y+offsets[x])*width+x;
                    if ((gray[i-7*width]+gray[i+7*width])/2-gray[i]>26) regions[Math.floor(x*8/width)]++;
                }
                if (regions.filter(count=>count>width/8*.27).length>=6 &&
                    regions.reduce((sum,count)=>sum+count,0)>width*.55) return true;
            }
        }
        return false;
    }

    function boundedDetails(context, column, lines, rows) {
        let sum=0;
        const boundaries=[];
        for (let i=0;i<rows.length;i++) {
            const row=rows[i];
            if (i>=2 && row.source==="primary" && row.amount===sum && !rows.slice(0,i).some(item=>item.summaryOnly)) {
                const followingTax=lines.some(line=>line.some(w=>/(?<!\d)(?:8|10)%/.test(w.text) &&
                    w.y0>row.y && w.y0<row.y+3.5*column.charHeight));
                const followingPaid=rows.slice(i+1).some(later=>later.source==="primary" &&
                    later.y<row.y+15*column.charHeight && later.amount>row.amount && later.amount<=row.amount*1.25);
                if (divider(context,column,rows[i-1],row) || (followingTax && followingPaid)) boundaries.push(i);
            }
            sum+=row.amount;
        }
        return boundaries.length===1 ? rows.slice(0,boundaries[0]) : null;
    }

    function inspect(context, lines) {
        const column=BrowserAmountProbe.amountColumn(context,lines);
        if (!column.right) return null;
        const rows=[], missing=[];
        for (const line of lines) {
            const prices=moneyOnLine(line).filter(p=>Math.abs(p.x1-column.right)<1.1*column.charHeight &&
                p.y>=column.start-column.charHeight*.2);
            if (prices.length===1) {
                rows.push(prices[0]);
            } else if (!prices.length) {
                const names=line.filter(w=>w.x0>=column.right*.28 && w.x1<column.right-3.4*column.charHeight &&
                    /[A-Za-zぁ-龯]/.test(w.text));
                if (!names.length) continue;
                const y=BrowserAmountProbe.median(names.map(w=>(w.y0+w.y1)/2));
                if (y>=column.start-column.charHeight*.2 && y<column.start+15*column.charHeight) missing.push(y);
            }
        }
        rows.sort((a,b)=>a.y-b.y);
        const complete=boundedDetails(context,column,lines,rows);
        const slots=complete ? [] : BrowserAmountProbe.selectSlots(context,column,rows.map(r=>r.y),missing);
        return {column,rows,missing,complete,slots};
    }

    function finish(context, lines, plan, values) {
        if (!plan || values.length!==plan.slots.length) return null;
        if (plan.complete) return plan.complete;
        const {column,rows,missing,slots}=plan, maxDistance=tolerance(column.charHeight);
        const potential=missing.map(y=>slots.flatMap((slot,i)=>Math.abs(slotCenter(slot)-y)<maxDistance &&
            values[i].length ? [i] : []));
        const recovered=missing.flatMap((y,i)=>{
            const near=potential[i];
            if (!near.length || potential.some((other,j)=>i!==j && other.some(slot=>near.includes(slot)))) return [];
            const amounts=new Set(near.flatMap(slot=>values[slot]));
            if (amounts.size!==1) return [];
            const [amount]=amounts;
            return Number.isSafeInteger(amount) && amount>0 ? [{y,amount,source:"crop"}] : [];
        });
        if (!recovered.length) return null;
        return boundedDetails(context,column,lines,[...rows,...recovered].sort((a,b)=>a.y-b.y));
    }

    function merge(primary, verified) {
        if (!verified || !primary.length || verified.length<=primary.length) return primary;
        const first=primary.map(row=>{
            if (Number.isSafeInteger(row.printedAmount) && row.printedAmount>0) return row.printedAmount;
            const match=/^(?:(\d+) × )?(\d+)$/.exec(row.hint || "");
            return match ? Number(match[1] || 1)*Number(match[2]) : 0;
        });
        function align(start, step) {
            let i=start;
            return (step===1 ? first : [...first].reverse()).map(value=>{
                while (verified[i] && verified[i].amount!==value) i+=step;
                const target=i;
                i+=step;
                return verified[target] ? target : -1;
            });
        }
        const forward=align(0,1), reverse=align(verified.length-1,-1).reverse();
        if (forward.some((index,i)=>index<0 || index!==reverse[i])) return primary;
        const saved=new Map(forward.map((index,i)=>[index,primary[i]]));
        if (verified.some((row,i)=>!saved.has(i) && (row.source!=="crop" ||
            i<=forward[0] || i>=forward.at(-1)))) return primary;
        return verified.map((row,i)=>saved.get(i) || {printedAmount:row.amount});
    }

    return {inspect,finish,merge};
})();
