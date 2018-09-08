module wxgame {
	export class ShareMessage {
		private static _instance: ShareMessage;
		private _data: Cmd.UploadShareInfoLittleGameLobbyCmd_CS;
		public static get instance() {
			if (!this._instance)
				this._instance = new ShareMessage();
			return this._instance;
		}

		/**监听被动转发 */
		public onShareAppMessage(title: string = "", imageUrl: string = "", query: string = "") {
			wx.onShareAppMessage((e) => {
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
		 * 消息分享
		 * @param title 分享标题
		 * @param imageUrl 分享图片url
		 * @param query 查询字符串 从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。
		 */
		async shareAppMessage(shareVo: uniLib.WXShareVo, success?: Function, fail?: Function): Promise<any> {
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
				if (random)
					title = table.newshareContent[random];
				else
					uniLib.TipsUtils.showTipsDownToUp("分享标题配置有误");
			}
			if (shareVo.shareImageUrl) {//如果传了image
				imageUrl = shareVo.shareImageUrl;
			} else {
				if (random)
					imageUrl = table.newsharepicture[random];
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
			shareVo.opType = Cmd.ShareOpType.share;
			return new Promise((resolve, reject) => {
				wx.shareAppMessage({
					title: shareVo.title,
					imageUrl: shareVo.shareImageUrl,
					query: query,
					success: (res) => {
						if (success)
							success();
						if (res) {
							if (res.shareTickets && res.shareTickets.length > 0) {//分享的是群
								this.getShareInfo(res.shareTickets[0]).then((data) => {
									if (data) {
										shareVo.shareTicket = JSON.stringify(data);
										this.sendShareMessage(shareVo);
									}
								}).catch(e => {
									console.log("获取群分享消息出错", e);
									uniLib.TipsUtils.showTipsDownToUp("获取群分享消息出错");
								});
							} else {//分享的是个人
								this.sendShareMessage(shareVo);
							}
						}
						uniLib.TipsUtils.showTipsDownToUp("分享成功");
						resolve(res)
					},
					fail: (res) => {
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
		public sendShareMessage(shareVo?: uniLib.WXShareVo): void {
			if (this._data) {//预留上次没发送成功的信息 在登陆上后再发一遍
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
				req.extData = shareVo.wgKvData
			this._data = req;
			this.sendShare();
		}

		private sendShare() {
			if (uniLib.NetMgr.ws && this._data) {
				uniLib.NetMgr.tcpSend(this._data);
				this._data = null;
			}
		}
	}
}