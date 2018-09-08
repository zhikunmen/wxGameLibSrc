module wxgame {
	export class Global {
		private static _instance: Global;
		public appId: string;
		public secret: string;
		private userInfoData: wgUserInfoData;
		public tableLobbyGameList: table.TableLobbyGameList
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
			Message.instance.init();
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
		/**获取用户消息 例如头像 昵称等 */
		async getUserInfo(): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.getUserInfo({
					withCredentials: true,
					success: (res: wgUserInfoData) => { this.userInfoData = res; resolve(res.userInfo) },
					fail: (err) => { reject(err) }
				})
			})
		}
		/**
		 * @param jscode login回调成功的code
		 */
		private getSessionKeyOpenId(jscode: string) {
			let wxUrl = "https://api.weixin.qq.com/sns/jscode2session?appid=" + this.appId + "&secret=" + this.secret + "&js_code=" + jscode + "&grant_type=authorization_code"
			let req = new egret.URLRequest(wxUrl);
			req.method = egret.URLRequestMethod.GET;
			let loader = new egret.URLLoader(req);
			loader.addEventListener(egret.Event.COMPLETE, (data: egret.Event) => {
				console.log("getSessionKeyOpenId   ");
				console.info(data);
			}, this);
		}

		/**退出当前小游戏 */
		async exitMiniProgram(success?: Function, fail?: Function, complete?: Function): Promise<any> {
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
			return new Promise((resolve, reject) => {
				wx.openCustomerServiceConversation({
					sessionFrom: "",
					showMessageCard: true,
					sendMessageTitle: title,
					sendMessagePath: "",
					sendMessageImg: imgUrl.match(/https/ig).length > 0 ? imgUrl + Utils.getVersionControlCode() : imgUrl,
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