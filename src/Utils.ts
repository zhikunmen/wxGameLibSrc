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
	}
}