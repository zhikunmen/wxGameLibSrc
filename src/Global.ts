module wxgame {
	export class Global {
		private static _instance: Global;
		public appId: string;
		public secret: string;
		private userInfoData: wgUserInfoData;
		public tableLobbyGameList: table.TableLobbyGameList
		public shareIconUrl: string;
		private isFirst: boolean = true;
		public static get instance() {
			if (!this._instance) {
				this._instance = new Global();
			}
			return this._instance;
		}
		/**
		 * @param appId 小游戏appid
		 * @param secret 小游戏秘钥
		 */
		async init(): Promise<any> {
			if (!Utils.isWxGame)//不是小游戏直接退出
				return;
			if (this.isFirst) {
				this.isFirst = false;
				Message.instance.init();
				ShareMessage.instance.showShareMenu(true);
			}
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
			if (!Utils.isWxGame)//不是小游戏直接退出
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
			if (!Utils.isWxGame)//不是小游戏直接退出
				return;
			return new Promise((resolve, reject) => {
				wx.openCustomerServiceConversation({
					sessionFrom: "",
					showMessageCard: true,
					sendMessageTitle: title,
					sendMessagePath: "",
					sendMessageImg: imgUrl ? (imgUrl.match(/http/ig).length > 0 ? imgUrl + Utils.getVersionControlCode() : imgUrl) : "",
					success: (res) => { resolve(res) },
					fail: (err) => { reject(err) }
				})
			})
		}

		/**打开同一公众号下关联的另一个小程序 */
		// async navigateToMiniProgram(appid: string, path: string = "", extraData: any = {}, envVersion: string = envVersionConst.RELEASE) {
		// 	return new Promise((resolve, reject) => {
		// 		wx.navigateToMiniProgram({
		// 			appId: appid,
		// 			path: path,
		// 			extraData: extraData,
		// 			envVersion: envVersion,
		// 			success: (res) => { resolve(res) },
		// 			fail: (err) => { console.error("navigateToMiniProgram fail"); reject(err) }
		// 		})
		// 	})
		// }

		/**调用设置交口 */
		async openSetting(): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.openSetting({
					success: (res) => { resolve(res) },
					fail: (error) => { reject(error); console.log("打开设置失败") }
				})
			})
		}
		/**调用授权 */
		async authorize(scopeStr: string): Promise<any> {
			return new Promise((resolve, reject) => {
				wx.authorize({
					scope: scopeStr,
					success: () => {
						resolve();
					},
					fail: () => {
						wx.showModal({
							title: "授权提示", content: "获取授权失败，请确认授权！", showCancel: false, success: () => {
								wxgame.Global.instance.openSetting().then((data) => {
									if (data.authSetting[scopeStr]) {
										resolve();
									} else {
										uniLib.TipsUtils.showTipsDownToUp("授权失败请重试");
										reject()
									}
								}, (error) => { reject(error) }).catch((error) => {
									reject(error);
								})
							}
						})
					}
				})
			})
		}

		/**banner unit id 数组*/
		public bannerUnitIdArr: string[] = ["adunit-1b42952355975af0"];
		private _bannerIndex: number = 0;
		private _sysInfo;
		private _bannerAd;
		/**广告组件是否准备好 */
		private _bannerIsReady: boolean = false;
		private onLoadBanner = () => { this._bannerIsReady = true; };
		private onErrorBanner = (err) => {
			this._bannerIsReady = false;
			this._bannerIndex++;
			this._bannerIndex = this._bannerIndex >= this.bannerUnitIdArr.length ? 0 : this._bannerIndex;
			// uniLib.TipsUtils.showTipsDownToUp("广告组件尚未准备好");
			console.log("广告拉取失败:" + JSON.stringify(err));
		}
		/**暂时只支持底部显示 */
		private onResizeBanner = () => {
			if (this._bannerAd && this._sysInfo) {
				this._bannerAd.style.top = this._sysInfo.screenHeight - this._bannerAd.style.realHeight;
			}
		}
		/**销毁显示的广告 */
		public destroyBannerAd() {
			if (this._bannerAd) {
				this._bannerAd.hide();
				this._bannerAd.offResize(this.onResizeBanner);
				this._bannerAd.offError(this.onErrorBanner);
				this._bannerAd.offLoad(this.onLoadBanner);
				this._bannerAd.destroy();
				this._bannerAd = null;
				this._bannerIsReady = false;
				this.wxCreateBannerAd();
			}
		}

		/**
		 * 创建banner 暂时只支持单个广告
		 */
		private wxCreateBannerAd(adUnitId?: string, style?: Object) {
			if (!this._sysInfo) {
				this._sysInfo = wx.getSystemInfoSync();
			}
			this._bannerAd = wx["createBannerAd"]({
				adUnitId: !!adUnitId ? adUnitId : this.bannerUnitIdArr[this._bannerIndex], style: style ? style : {
					left: (this._sysInfo.screenWidth - 300) / 2,
					top: this._sysInfo.screenHeight - 86,
					width: 300
				}
			});
			this._bannerAd.onResize(this.onResizeBanner);
			this._bannerAd.onError(this.onErrorBanner);
			this._bannerAd.onLoad(this.onLoadBanner);
		}

		/**
		 * 获取广告banner
		 * 默认靠低居中
		 * @style 暂时支持top left right width设置
		 */
		public createBannerAd(adUnitId?: string, style?: Object) {
			if (uniLib.Global.isWxGame()) {
				if (!this._sysInfo) {
					this._sysInfo = wx.getSystemInfoSync();
				}
				if (this._bannerAd && this._bannerIsReady) {
					if (style) {
						if (style["width"] != undefined)
							this._bannerAd.style.width = style["width"];
						if (style["top"] != undefined)
							this._bannerAd.style.top = style["top"];
						if (style["left"] != undefined)
							this._bannerAd.style.left = style["left"];
						if (style["right"] != undefined)
							this._bannerAd.style.left = this._sysInfo.screenWidth - this._bannerAd.style.realWidth;;
					}
					this._bannerAd.show();
				}
				else {
					this.wxCreateBannerAd(adUnitId, style);
				}
			}
		}

		/**video unit id 数组*/
		public videoUnitIdArr: string[] = ["adunit-ebbeeb9f7cbb945f"];
		private _videoAd;
		private _videoCallFun: Function;
		private _vidoeCallObj: any;
		private _videoAdCanUse: boolean = true;

		private onErrorVideo = (err) => {
			console.log("视频拉取失败:" + JSON.stringify(err));
			this._videoAdCanUse = false;
		}

		private onCloseVideo = (res) => {
			uniLib.SoundMgr.instance.resumeBgMusic();
			if (res && res.isEnded || res == undefined) {
				this._videoCallFun && this._videoCallFun.apply(this._vidoeCallObj);
			}
			else {
				uniLib.TipsUtils.showTipsDownToUp("未观看完整视频不能获得奖励");
			}
		}

		/**获取激励视频video 
		 * sucCall 看完视频的回调
		*/
		public createRewardedVideoAd(adUnitId?: string, sucCall?: Function, callObj?: any) {
			if (uniLib.Global.isWxGame()) {
				if (this._videoAdCanUse == false) {
					sucCall && sucCall.call(callObj);
				}
				else {
					if (this._videoAd) {
						this._videoCallFun = sucCall;
						this._vidoeCallObj = callObj;
						/** show 自动拉取成功会返回resolve 否则reject 手动load会直接resolve */
						this._videoAd.show().then(() => { this._videoAdCanUse = true; uniLib.SoundMgr.instance.pauseBgMusic(); }, () => {
							this._videoAd.load().then(() => {
								this._videoAd.show();
							}, () => {
								this._videoAdCanUse = false;
								this._videoCallFun = null;
								this._vidoeCallObj = null;
								sucCall && sucCall.apply(callObj);
							});
						});
					}
					else {
						if (wx["createRewardedVideoAd"]) {
							this._videoAd = wx["createRewardedVideoAd"]({ adUnitId: !!adUnitId ? adUnitId : this.videoUnitIdArr[0] });
							/**低版本有问题但是会直接回调onLoad */
							this._videoAd.onLoad(() => { console.log("视频加载完毕") });
							this._videoAd.onError(this.onErrorVideo);
							this._videoAd.onClose(this.onCloseVideo);
						}
						else {
							this._videoAdCanUse = false;
							uniLib.TipsUtils.showTipsDownToUp("微信版本过低请更新微信");
							sucCall && sucCall.call(callObj);
						}
					}
				}
			}
		}

		/**
 		* 阿拉丁事件统计
 		*/
		public aldSendEvent(name: string, value: string | Object) {
			egret.Capabilities.runtimeType == egret.RuntimeType.WXGAME && wx["aldSendEvent"] && wx["aldSendEvent"](name, value);
		}
	}
}