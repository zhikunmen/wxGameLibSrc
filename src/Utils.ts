module wxgame {
	export class Utils {
		/**弹框 */
		public static showConfirm(info: string, title: string = "", oktxt: string = "确认", okFunc?: Function, caltxt?: string, calFunc?: Function) {
			if (!uniLib.Global.isWxGame())
				return;
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
		public static get isWxGame(): boolean {
			if (!uniLib.Global.isWxGame()) {
				console.warn("当前测试环境不是微信小游戏，导致功能失效")
				return false;
			}
			return true;
		}

		/**获取定位 */
		public static getPosition(callBack?: Function, thisObj?: any) {
			Global.instance.authorize("scope.userLocation").then(() => {
				wx.getLocation({
					success: (res) => {
						let info = { code: 0, data: res };
						callBack.call(thisObj, info)
					},
					fail: (err) => {
						uniLib.TipsUtils.showTipsDownToUp("定位失败，请重试" + err)
						let info = { code: -1 };//未获得定位 与app版消息保存一直
						callBack.call(thisObj, info);
					}
				})
			}, (err) => {
				uniLib.TipsUtils.showTipsDownToUp("接口调起失败" + err);
				let info = { code: -1 };
				callBack.call(thisObj, info);
			})
		}

		/**小游戏获取手机信息 */
		public static get isIos(): boolean {
			if (uniLib.Global.isWxGame()) {
				try {
					return wx.getSystemInfoSync()["system"].match(/IOS/ig) ? true : false;
				} catch (e) {
					return false;
				}
			} else {
				return uniLib.Utils.isIOS();
			}
		}
		/**
		 * 小程序截图--异步版本 返回imageData
		 * @param rect截图区域
		 * @param destW目标文件的宽度，会将截取的部分拉伸或压缩至该数值
		 * @param destH目标文件的高度，会将截取的部分拉伸或压缩至该数值
		 * @return 截图之后的数据;
		 */
		public static catchScreenToData(rect?: egret.Rectangle, destW?: number, destH?: number): Promise<any> {
			let sysInfo = wx.getSystemInfoSync();
			return new Promise((resolv, reject) => {
				let obj: any = {
					quality: 0.7,
					fileType: "jpg",
					success: (res) => {
						resolv(res.tempFilePath);
					},
					fail: (err) => {
						uniLib.TipsUtils.showTipsDownToUp("截图失败！", err);
						reject(err);
					}
				};
				if (rect) {
					let scaleX = window["canvas"].width / uniLib.Global.screenWidth;
					let scaleY = window["canvas"].height / uniLib.Global.screenHeight;
					obj.x = rect.x * scaleX;
					obj.y = rect.y * scaleY;
					obj.width = rect.width * scaleX;
					obj.height = rect.height * scaleY;
					obj.destWidth = rect.width * sysInfo["pixelRatio"];
					obj.destHeight = rect.height * sysInfo["pixelRatio"];
				}
				if (destW) {
					obj.destWidth = destW * sysInfo["pixelRatio"];
				}
				if (destH) {
					obj.destHeight = destH * sysInfo["pixelRatio"];
				}
				canvas.toTempFilePath(obj);
			});
		}
		/**
		 * 小程序截图--同步截图 返回imageUrl
		 * @param rect截图区域
		 * @param destW目标文件的宽度，会将截取的部分拉伸或压缩至该数值
		 * @param destH目标文件的高度，会将截取的部分拉伸或压缩至该数值
		 * @return 截图之后的数据;
		 */
		public static catchScreenToPathSync(rect?: egret.Rectangle, destW?: number, destH?: number): string {
			let sysInfo = wx.getSystemInfoSync();
			let obj: any = {
				quality: 0.7,
				fileType: "jpg",
			};
			if (rect) {
				let scaleX = window["canvas"].width / uniLib.Global.screenWidth;
				let scaleY = window["canvas"].height / uniLib.Global.screenHeight;
				obj.x = rect.x * scaleX;
				obj.y = rect.y * scaleY;
				obj.width = rect.width * scaleX;
				obj.height = rect.height * scaleY;
				obj.destWidth = rect.width * sysInfo["pixelRatio"];
				obj.destHeight = rect.height * sysInfo["pixelRatio"];
			}
			if (destW) {
				obj.destWidth = destW * sysInfo["pixelRatio"];
			}
			if (destH) {
				obj.destHeight = destH * sysInfo["pixelRatio"];
			}
			return canvas.toTempFilePathSync(obj);
		}
		/**异步截图 */
		public static catchScreenToTex(rect?: egret.Rectangle, cs?: any): Promise<any> {
			let sysInfo = wx.getSystemInfoSync();
			// if (sysInfo["brand"] && (sysInfo["brand"].toUpperCase()).indexOf("HUAWEI") != -1) {
			// 	return null;
			// }
			if (rect) {
				let scaleX = cs ? cs.width / sysInfo["screenWidth"] : uniLib.Global.screenWidth / sysInfo["screenWidth"];
				let scaleY = cs ? cs.height / sysInfo["screenHeight"] : uniLib.Global.screenHeight / sysInfo["screenHeight"];
				return new Promise((resolve, reject) => {
					var obj = {
						x: cs ? rect.x : rect.x * scaleX,
						y: cs ? rect.y : rect.y * scaleY,
						width: cs ? (cs.width > rect.width ? rect.width : cs.width) : rect.width * scaleX,
						height: cs ? (cs.height > rect.height ? rect.height : cs.height) : rect.height * scaleY,
						destWidth: 640 * sysInfo["pixelRatio"],
						destHeight: 512 * sysInfo["pixelRatio"],
						fileType: "jpg",
						success: (res) => {
							resolve(res.tempFilePath);
						},
						fail: (err) => {
							uniLib.TipsUtils.showTipsDownToUp("截图失败！", err);
							resolve(null)
						}
					}
					if (cs) {
						cs.toTempFilePath(obj);
					} else {
						canvas.toTempFilePath(obj);
					}
				});

			} else {
				return new Promise((resolve, reject) => {
					canvas.toTempFilePath({
						success: (res) => {
							resolve(res.tempFilePath);
						},
						fail: (err) => {
							console.log("截图失败")
							reject(err);
						}
					})
				})
			}
		}

		/**
		 * 版本比较
		 * @param version当前版本
		 * @param compVersion 需要比较的版本
		 * @return 0版本一样 1大于比较版本 -1小与比较版本;
		 */
		public static compareVersion(version: string, compVersion): number {
			let v1 = version.split('.');
			let v2 = compVersion.split('.');
			const len = Math.max(v1.length, v2.length)
			while (v1.length < len) {
				v1.push('0')
			}
			while (v2.length < len) {
				v2.push('0')
			}
			for (let i = 0; i < len; i++) {
				const num1 = parseInt(v1[i])
				const num2 = parseInt(v2[i])
				if (num1 > num2) {
					return 1;
				}
				else if (num1 < num2) {
					return -1;
				}
			}
			return 0
		}
	}
}