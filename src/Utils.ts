module wxgame {
	export class Utils {
		/**弹框 */
		public static showConfirm(info: string, title: string = "", oktxt: string = "确认", okFunc?: Function, caltxt?: string, calFunc?: Function) {
			let showcancel = false;
			if (caltxt != undefined) {
				showcancel = true;
			} else {
				caltxt = "取消";
			}
			wx.showModal({
				title: title,
				content: info,
				showCancel: showcancel,
				cancelText: caltxt,
				confirmText: oktxt,
				success: (res) => {
					if (res.confirm) {
						if (okFunc)
							okFunc();
					}
					if (res.cancel) {
						if (calFunc)
							calFunc();
					}
				},
				fail: (err) => {
					console.log("showModal调用失败");
				}
			})
		}

		/**时间戳 做版本控制 */
		public static getVersionControlCode(): string {
			return "?v=" + new Date().getTime();
		}

		/**检查当前是否是微信小游戏 不能导致h5上报错 */
		public static get isWxGame(): boolean{
			if(!uniLib.Global.isWxGame()){
				console.warn("当前测试环境不是微信小游戏，导致功能失效")
				return false; 
			}
			return true;
		}
	}
}