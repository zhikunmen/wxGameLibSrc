module wxgame {
	export class Message {
		private static _instance: Message;
		public key: Array<string>;
		public launchOption: LaunchOptions;
		public static get instance(): Message {
			if (!this._instance)
				this._instance = new Message();
			return this._instance
		}
		public init(): void {
			this.launchOption = wx.getLaunchOptionsSync();
			this.initLaunchOption();
			this.addOnShowEvent();
		}

		/**
		 * 初始化启动参数
		 */
		private initLaunchOption() {
			if (!this.launchOption)
				return;
			var data = this.launchOption;
			let query: shareQuery;
			if (data.query) {
				query = data.query as shareQuery;
			}
			let shareVo = new uniLib.WXShareVo();
			shareVo.opType = Cmd.ShareOpType.click
			if (query.shareType)
				shareVo.shareType = Number(query.shareType);
			if (query && query.uid) {
				shareVo.fromUid = Number(query.uid);
				if (data.shareTicket) {//群分享
					ShareMessage.instance.getShareInfo(data.shareTicket).then((data) => {
						if (data && data.errMsg.indexOf("ok") >= 0) {
							shareVo.shareTicket = JSON.stringify(data);
							ShareMessage.instance.sendShareMessage(shareVo);
						}
					}).catch((e => {
						console.log("获取群消息失败",e)
						uniLib.TipsUtils.showTipsDownToUp("获取群消息失败");
					}))
				} else {//个人分享
					ShareMessage.instance.sendShareMessage(shareVo);
				}
			}
		}
		/**监听小游戏回到前台的事件 */
		private addOnShowEvent(): void {
			wx.onShow((res: LaunchOptions) => {
				this.launchOption = res;
				this.initLaunchOption();
			})
		}



		private _rankBit: egret.Bitmap;
		/**设置用户数据上报 */
		public setUserCloudStorage(KVDataList: Array<KVData>) {
			return new Promise((resolve, reject) => {
				wx.setUserCloudStorage({
					KVDataList: KVDataList,
					success: (res) => {
						console.log("setUserCloudStorage success", res);
						resolve(res);
						OpenData.instance.sendShareData({ command: "open", type: "friend" });
					},
					fail: (res) => {
						console.error("setUserCloudStorage success", res);
						reject(res);
					}
				})
			})
		}
	}
}