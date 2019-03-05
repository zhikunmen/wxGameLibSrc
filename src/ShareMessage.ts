module wxgame {
	export class ShareMessage {
		private static _instance: ShareMessage;
		private _data: Cmd.UploadShareInfoLittleGameLobbyCmd_CS;
		private _lastTimeOutSec;
		public static get instance() {
			if (!this._instance)
				this._instance = new ShareMessage();
			return this._instance;
		}

		/**监听被动转发 */
		public onShareAppMessage(title: string = "", imageUrl: string = "", query: string = "") {
			wx.onShareAppMessage((e) => {
				if (!title || title.trim() == "") {
					let random;
					let table = Global.instance.tableLobbyGameList;
					if (table && Array.isArray(table.newshareContent)) {
						random = Math.floor(Math.random() * table.newshareContent.length);
						title = table.newshareContent[random];
						if (Global.instance.shareIconUrl[Global.instance.shareIconUrl.length - 1] != "/") {
							Global.instance.shareIconUrl += "/";
						}
						imageUrl = Global.instance.shareIconUrl + "shareIcons/" + table.newsharepicture[random];
					}
				}
				console.log("用户点击事件");
				return {
					title: title,
					imageUrl: imageUrl,
					query: query
				}
			})
		}

		/**
		 * 显示转发按钮
		 * @param ticket 是否带ticket 可以获取群id做群排行使用
		 */
		async showShareMenu(ticket: boolean = true): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.showShareMenu({
					withShareTicket: ticket,
					success: (res) => { console.log("showShareMenu success:  " + res); resolve(true) },
					fail: (err) => { console.log("showShareMenu fail:  " + err); reject(false) },
					complete: () => { }
				})
			})
		}
		/**
		 * 隐藏转发按钮
		 */
		async hideShareMenu(): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.hideShareMenu({
					success: (res) => { console.log("hideShareMenu success:  " + res); resolve(true) },
					fail: (warn) => { console.log("hideShareMenu fail:  " + warn); reject(false) },
					complete: () => { }
				});
			})
		}
		/**更新转发属性 */
		async updateShareMenu(ticket): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.updateShareMenu({
					withShareTicket: ticket,
					success: (res) => { console.log("updateShareMenu success:  " + res); resolve(true) },
					fail: (warn) => { console.log("updateShareMenu fail:  " + warn); reject(false) },
					complete: () => { }
				})
			})
		}
		/**
		 * 消息分享 如果写死分享的话务必填写shareVo.title和shareVo.shareImageUrl
		 * @param shareVo 分享数据
		 */
		async shareAppMessage(shareVo: uniLib.WXShareVo, success?: Function, fail?: Function): Promise<any> {
			if (uniLib.Global.isInGame) {
				this._lastTimeOutSec = uniLib.Global.msgTimeOutSec;
				uniLib.Global.msgTimeOutSec = 120;
			}
			let title = "";
			let imageUrl = "";
			let random;
			let table = Global.instance.tableLobbyGameList;
			if (table && Array.isArray(table.newshareContent)) {
				random = Math.floor(Math.random() * table.newshareContent.length);
			}
			if (shareVo.title) {//如果传了title
				title = shareVo.title;
			} else {
				if (!isNaN(random))
					title = table.newshareContent[random];
				else
					uniLib.TipsUtils.showTipsDownToUp("分享标题配置有误");
			}
			if (shareVo.shareImageUrl || shareVo.shareImageData) {//如果传了image
				shareVo.shareImageUrl ? (imageUrl = shareVo.shareImageUrl) : (imageUrl = shareVo.shareImageData)
				console.log("imageUrl:" + JSON.stringify(imageUrl));
			} else {
				if (!isNaN(random) && Global.instance.shareIconUrl) {
					if (Global.instance.shareIconUrl[Global.instance.shareIconUrl.length - 1] != "/") {
						Global.instance.shareIconUrl += "/";
					}
					imageUrl = Global.instance.shareIconUrl + "shareIcons/" + table.newsharepicture[random];
				}
				else
					uniLib.TipsUtils.showTipsDownToUp("分享图片配置有误");
			}
			let query = "uid=" + uniLib.UserInfo.uid;
			if (shareVo.shareType) {
				query += "&shareType=" + shareVo.shareType;
			}
			if (shareVo.roomId) {//之前游戏是按照json字符串类型传的
				let obj = JSON.parse(shareVo.roomId);
				if (obj && obj.roomId)
					query += "&roomId=" + obj.roomId
			}
			if (shareVo.wgShareData) {
				query += "&wgShareData=" + shareVo.wgShareData;
			}
			shareVo.opType = Cmd.ShareOpType.share;
			if (success)
				success();
			this.sendShareMessage(shareVo);
			return new Promise((resolve, reject) => {
				wx.shareAppMessage({
					title: title,
					imageUrl: (Array.isArray(imageUrl.match(/http/ig)) && imageUrl.match(/http/ig).length > 0) ? imageUrl + Utils.getVersionControlCode() : imageUrl,
					query: query,
					success: (res) => {
						this.resetTimeSec();
						console.log(res);
						if (success)
							success();
						if (res) {
							if (res.shareTickets && res.shareTickets.length > 0) {//分享的是群
								// this.getShareInfo(res.shareTickets[0]).then((data) => {
								// 	if (data) {
								// 		shareVo.shareTicket = JSON.stringify(data);
								// 		this.sendShareMessage(shareVo);
								// 	}
								// }).catch(e => {
								// 	console.log("获取群分享消息出错", e);
								// 	uniLib.TipsUtils.showTipsDownToUp("获取群分享消息出错");
								// });
							} else {//分享的是个人
								console.log("分享的是个人");
								// this.sendShareMessage(shareVo);
							}
						}
						uniLib.TipsUtils.showTipsDownToUp("分享成功");
						resolve(res)
					},
					fail: (res) => {
						this.resetTimeSec();
						if (fail)
							fail();
						uniLib.TipsUtils.showTipsDownToUp("分享失败");
						resolve(false)
					}
				})
			})
		}
		/**
		 * 获得分享
		 */
		async getShareInfo(ticket: string): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.getShareInfo({
					shareTicket: ticket,
					success: (res) => { resolve(res) },
					fail: (err) => { console.log("getShareInfo fail") + err },
					complete: () => { }
				})
			})
		}

		/**
		 * 发送分享数据
		 * @param opType  操作类型
		 * @param jsonShare 是否分享群
		 *  */
		async sendShareMessage(shareVo?: uniLib.WXShareVo): Promise<any> {
			let code;
			await Global.instance.init().then((res) => { if (res.errMsg.indexOf("ok") >= 0) code = res.code }, () => { egret.error("sendShareMessage reject") });
			// await this.checkSession().then((res) => { },//未过期不做处理
			// 	(res) => {//过期再那一边登陆code
			// 		Global.instance.init().then((res) => {
			// 			code = res;
			// 		})
			// 	})
			if (this._data || !shareVo) {//预留上次没发送成功的信息 在登陆上后再发一遍
				if (code) {
					if (this._data && this._data.shareType && this._data.shareType == Cmd.ShareType.ios) {
						let obj = {};
						if (this._data.extData) {
							obj = JSON.parse(this._data.extData);
							obj["code"] = code;
						} else {
							obj["code"] = code;
						}
						this._data.extData = JSON.stringify(obj);
					}
				}
				this.sendShare();
				return;
			}
			let req = new Cmd.UploadShareInfoLittleGameLobbyCmd_CS();
			if (shareVo.fromUid)//从谁的uid点进小游戏
				req.uid = shareVo.fromUid;
			if (shareVo.shareType)//小游戏分享类型
				req.shareType = shareVo.shareType;
			if (shareVo.opType)//小游戏操作类型
				req.opType = shareVo.opType;
			if (shareVo.shareTicket)//小游戏群分享tickets
				req.jsonShare = shareVo.shareTicket
			if (shareVo.wgKvData)//小游戏游戏附带数据
				req.extData = shareVo.wgKvData;
			if (shareVo.wgShareData)//带给服务器的数据
				req.extData = shareVo.wgShareData;
			if (req.shareType && req.shareType == Cmd.ShareType.ios && code) {
				let obj = {};
				if (req.extData) {
					obj = JSON.parse(req.extData);
					obj["code"] = code;
				} else {
					obj["code"] = code;
				}
				req.extData = JSON.stringify(obj);
			}
			this._data = req;
			this.sendShare();
		}

		async checkSession(): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.checkSession({
					success: (res) => { resolve(res) },//登录态未过期
					fail: (res) => { reject(res) }//登陆过期
				});
			})
		}

		private sendShare() {
			if (NetMgr.ws && this._data) {
				NetMgr.tcpSend(this._data);
				this._data = null;
			}
		}
		/**回滚游戏压后台时间 */
		private resetTimeSec() {
			if (uniLib.Global.isInGame && this._lastTimeOutSec) {
				uniLib.Global.msgTimeOutSec = this._lastTimeOutSec;
			}
		}
	}
}