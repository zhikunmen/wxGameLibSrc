module wxgame {
	export class Global {
		private static _instance: Global;
		public appId: string;
		public secret: string;
		private userInfoData: wgUserInfoData;
		public tableLobbyGameList: table.TableLobbyGameList
		public shareIconUrl: string;
		public static get instance() {
			if (!this._instance)
				this._instance = new Global();
			return this._instance;
		}
		/**
		 * @param appId 小游戏appid
		 * @param secret 小游戏秘钥
		 */
		async init(): Promise<any> {
			if(!Utils.isWxGame)//不是小游戏直接退出
				return;
			Message.instance.init();
			ShareMessage.instance.showShareMenu(true);
			return new Promise((resolve, reject) => {
				wx.login({
					success: (code) => {
						resolve(code);
						console.log("login success: " + code.code);
						// this.getSessionKeyOpenId(code);
					},
					fail: (e) => {
						reject(false);
						console.error("login fail: " + e);
					},
					complete: () => { }
				})
			})
		}

		/**退出当前小游戏 */
		async exitMiniProgram(success?: Function, fail?: Function, complete?: Function): Promise<any> {
			if(!Utils.isWxGame)//不是小游戏直接退出
				return;
			return new Promise((resolve, reject) => {
				wx.exitMiniProgram({
					success: () => {
						if (success)
							success();
						resolve(true)
					},
					fail: () => {
						if (fail)
							fail();
						reject(false)
					},
					complete: complete
				})
			})
		}

		/**跳转客服回话 */
		async openCustomerServiceConversation(showCard: boolean, title: string = CustomerServiceConst.DEFAULTTITLE, imgUrl?: string) {
			if(!Utils.isWxGame)//不是小游戏直接退出
				return;
			return new Promise((resolve, reject) => {
				wx.openCustomerServiceConversation({
					sessionFrom: "",
					showMessageCard: true,
					sendMessageTitle: title,
					sendMessagePath: "",
					sendMessageImg: imgUrl ? (imgUrl.match(/https/ig).length > 0 ? imgUrl + Utils.getVersionControlCode() : imgUrl) : "",
					success: (res) => { resolve(res) },
					fail: (err) => { reject(err) }
				})
			})
		}

		/**打开同一公众号下关联的另一个小程序 */
		async navigateToMiniProgram(appid: string, path: string = "", extraData: any = {}, envVersion: string = envVersionConst.RELEASE) {
			return new Promise((resolve, reject) => {
				wx.navigateToMiniProgram({
					appId: appid,
					path: path,
					extraData: extraData,
					envVersion: envVersion,
					success: (res) => { resolve(res) },
					fail: (err) => { console.error("navigateToMiniProgram fail"); reject(err) }
				})
			})
		}
	}
}