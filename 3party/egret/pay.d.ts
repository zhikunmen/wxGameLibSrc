declare class Play68 {
    /**
     * 打开收银台
     * @param itemid {string} 商品id
     * @param itemname {string} 商品名
     * @param price {number} 商品单价
     * @param count {number} 购买数量
     */
    static pay(itemid: string, itemname: string, price: number, count: number): void;

    /**
     * 支付成功回调
     */
    static onpaysucc(): void;
}

declare class AiBeiPay {
    //var h5url = 'https://web.iapppay.com/h5';
    //var baseRandom = (Math.random() + "").replace(".", "");
    //var baseZIndex = 0;

    clickAibei(data: any): void;
}

declare class yunyou {
    /**
     * 打开收银台
     * @param itemid {string} 商品id
     * @param itemname {string} 商品名
     * @param price {number} 商品单价
     * @param count {number} 购买数量
     */
    static pay(): void;

    static redirecturl: string;
    static order_token: string;

    /**
     * 支付成功回调
     */
    static retfunc(data): void;
}

declare class HuoSuSdk {
    static config(data: any): void;
	static login(callback:Function, thisObj:any):void;
	static checkLogin (callback:Function, thisObj:any):void;
	static pay(data:any, payCallback:Function, backTxt:string):void;
}

/**
 * 59游戏
 */
declare class ylGame{

    constructor(data: any);
    /**
     * 调起支付页面
     */
    pay(data: any, callback: Function);
}