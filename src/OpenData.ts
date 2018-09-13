module wxgame {
	export class OpenData {
		private static _instance: OpenData;
		public static get instance(): OpenData {
			if (!this._instance)
				this._instance = new OpenData();
			return this._instance;
		}
		private _openDataContext: OpenDataContext;

		public sendShareData(kvdata: any): void {
			if(!Utils.isWxGame)//不是小游戏直接退出
				return;
			this._openDataContext = wx.getOpenDataContext();
			this._openDataContext.postMessage(kvdata);//在Message onMessage里获取
		}

		public createDisplayObject(type, width, height) {
			const bitmapdata = new egret.BitmapData(window["sharedCanvas"]);
			bitmapdata.$deleteSource = false;
			const texture = new egret.Texture();
			texture._setBitmapData(bitmapdata);
			const bitmap = new egret.Bitmap(texture);
			bitmap.width = width;
			bitmap.height = height;

			egret.startTick((timeStarmp) => {
				egret.WebGLUtils.deleteWebGLTexture(bitmapdata.webGLTexture);
				bitmapdata.webGLTexture = null;
				return false;
			}, this);
			return bitmap;
		}
	}
}