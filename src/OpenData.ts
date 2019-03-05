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
			if (!Utils.isWxGame)//不是小游戏直接退出
				return;
			this._openDataContext = wx.getOpenDataContext();
			this._openDataContext.postMessage(kvdata);//在Message onMessage里获取
		}

		public createDisplayObject(type, width, height, offsetY) {
			let sharedCanvas = window["sharedCanvas"];
			sharedCanvas.width = width;
			sharedCanvas.height = height;
			const bitmapdata = new egret.BitmapData(sharedCanvas);
			bitmapdata.$deleteSource = false;
			const texture = new egret.Texture();
			texture._setBitmapData(bitmapdata);
			const bitmap = new egret.Bitmap(texture);
			bitmap.width = width;
			bitmap.height = height;
			bitmap.y = offsetY;
			if (egret.Capabilities.renderMode == "webgl") {
				const renderContext = egret["wxgame"].WebGLRenderContext.getInstance();
				const context = renderContext.context;            ////需要用到最新的微信版本            ////调用其接口WebGLRenderingContext.wxBindCanvasTexture(number texture, Canvas canvas)            ////如果没有该接口，会进行如下处理，保证画面渲染正确，但会占用内存。
				if (!context.wxBindCanvasTexture) {
					egret.startTick((timeStarmp) => {
						egret.WebGLUtils.deleteWebGLTexture(bitmapdata.webGLTexture);
						bitmapdata.webGLTexture = null;
						return false;
					}, this);
				}
			}
			return bitmap;
		}
	}
}