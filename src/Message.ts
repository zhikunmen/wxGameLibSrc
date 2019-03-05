module wxgame {
	export class Message {
		private static _instance: Message;
		public key: Array<string>;
		public launchOption: any;
		public static get instance(): Message {
			if (!this._instance)
				this._instance = new Message();
			return this._instance
		}
		public init(): void {
			this.launchOption = wx.getLaunchOptionsSync();
			this.initLaunchOption();
			this.addOnShowEvent();
			this.onMemoryWarning();
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
			if (query.wgShareData)
				shareVo.wgShareData = query.wgShareData;
			if (query && query.uid) {
				shareVo.fromUid = Number(query.uid);
				if (data.shareTicket) {//群分享
					ShareMessage.instance.getShareInfo(data.shareTicket).then((data) => {
						if (data && data.errMsg.indexOf("ok") >= 0) {
							shareVo.shareTicket = JSON.stringify(data);
							ShareMessage.instance.sendShareMessage(shareVo);
						}
					}).catch((e => {
						console.log("获取群消息失败", e)
						uniLib.TipsUtils.showTipsDownToUp("获取群消息失败");
					}))
				} else {//个人分享
					ShareMessage.instance.sendShareMessage(shareVo);
				}
			}
			this.launchOption = null;
		}
		/**监听小游戏回到前台的事件 */
		private addOnShowEvent(): void {
			wx.offShow((res) => { this.onShow(res) });
			wx.onShow((res) => { this.onShow(res) })
		}

		/** */
		private onShow(res?: LaunchOptions) {
			wx.setKeepScreenOn({ keepScreenOn: true })
			if (!this.launchOption && res)
				this.launchOption = res;
			this.initLaunchOption();
		}

		private _rankBit: egret.Bitmap;
		/**设置用户数据上报 */
		public setUserCloudStorage(KVDataList: Array<any>) {
			return new Promise((resolve, reject) => {
				wx.setUserCloudStorage({
					KVDataList: KVDataList,
					success: (res) => {
						console.log("setUserCloudStorage success", res);
						resolve(res);
					},
					fail: (res) => {
						console.error("setUserCloudStorage success", res);
						reject(res);
					}
				})
			})
		}
		/**
		 * 内存警报 建立在fundebug第三方工具上  让服务器做怕是觉得有压力
		 * */
		private onMemoryWarning() {
			if (!Utils.isIos) {//目前只有安卓可以监听到  只监听内存严重事件
				wx.onMemoryWarning((res) => {
					if (res && res.level) {
						switch (res.level) {
							case 5://内存正常
								break;
							case 10://内存较低
								console.warn("内存较低" + res.level);
								break;
							case 15://内存严重
								console.warn("内存严重" + res.level);
								// if(window["fundebug"])
								// 	window["fundebug"].notify("内存警报", "内存严重");
								break;
						}
					}
				})
			}
		}
	}
}