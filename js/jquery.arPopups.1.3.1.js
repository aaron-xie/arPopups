/*
 *   jquery.arPopups.js
 *  ===========================
 *   v1.2.8 [2013.05.16]
 *  ===========================
 *   power by Aaron 
 *   Aaron.xiexie@gmail.com
 */
;(function($){
	$.fn.arPopups = function(options){
			var opts = $.extend({},$.fn.arPopups.defaults,options);
			//return this.each(function(){
			var $pop = this;
			var $win = $(window);
			var $body = $("body");
			var _$overlay = $('div.arp-overlay'); //_$overlay半透明层
			var _timeout , _content; //_content弹窗内容
			var _html = '<div class="arpopups'+($.trim(opts.class) ? " "+opts.class : "")+'">\n'
							+'<div class="arp-close"><span>Close</span></div>\n' 
							+(!opts.title ? '' : '<div class="arp-title"><span>' + opts.title + '</span></div>\n') 
							+'<div class="arp-content"></div>\n'
						  +'</div>';
			
			
			//写入内容
			this.setContent = function(content){
				if(!content) return $pop;
				if(content.jquery){
					$("div.arp-content",$pop).empty().append(content)
				}else if(opts.content.url){
					var loadUrl = typeof(opts.url)=="String" && opts.url.substring(0,1)==="@" ? $pop.attr(opts.url.substring(1)) : opts.url;
					if (opts.requestType && $.inArray(opts.requestType, ['iframe', 'ajax','img'])!=-1) {
						$con.html('<div id="ajaxLoading"><img src="'+opts.imgURL+'loading.gif" /></div>');				
						if (opts.requestType === "img") {
							//jq实现
							/*var $img = $("<img />");
							$img.attr("src",loadUrl).load(function(){
								$con.empty().html($img);
								return afterHandleClick();
							});*/
							
							//js实现
							var img = new Image(); //创建一个Image对象，实现图片的预下载
							img.src = loadUrl;
							if(img.complete){// 如果图片已经存在于浏览器缓存
								$con.empty()[0].appendChild(img);
								return afterHandleClick();
								
							}
							img.onload = function(){
								$con.empty()[0].appendChild(img);
								return afterHandleClick();
							}
						}else if(opts.requestType === "ajax"){
							if(opts.requestData!=null){
								$.get(loadUrl,opts.requestData,function(data){
									$con.html(data);
									return afterHandleClick();
								},opts.requestData.dataType);
							}else{
								$con.load(loadUrl+[opts.filter!=null?" " + opts.filter:""],afterHandleClick);
							}
						}else{
							ifr = $('<iframe name="arIframe" scrolling="auto" frameborder="0"/>');						
							ifr.appendTo($con.empty()).attr("src",loadUrl).load(function(){
								if(opts.size!=null){
									ifr.css({
										width:opts.size.width - parseInt($con.css("padding-left"))*2,
										height:opts.size.height ? opts.size.height - $title.outerHeight() - parseInt($con.css("padding-top"))*2 : $win.height()/2
									});
								}else{
									var $it = $(this).contents();
									var fH = $it.height();//iframe height
									var fW = $it.width();
									var newW = Math.min($win.width() - 40, fW);
									var newH = $win.height() - 25 - (!opts.title ? 0 : 30);
									newH = Math.min(newH, fH);
									if (!newH){
										return;
									}
									$(this).css({
										height: newH,
										width: newW
									});
								}
								return afterHandleClick();
							});
						}				
					}else{//显示本页面内容，支持所有jq选择器
						$(loadUrl).clone(true).show().appendTo($con.empty());
						return afterHandleClick();
					}
				}else{
					$("div.arp-content",$pop).htm(content);
				}
				return $pop;
			}
			
			//弹窗函数
			this.show = function(){
				
				//设置弹窗尺寸
				if(opts.size){
					$pop.css({
						width:opts.size.width,
						height:opts.size.height
					});
				}
				
				//写入html
				$pop.setContent(_html).appendTo($body).setPosition();
				
				if(typeof opts.callback === "function"){
					opts.callback($pop);
				}else if(opts.callback && typeof opts.callback.afterPop === "function") opts.callback.afterPop($pop);
			}
			
			//关闭弹出框函数
			 this.close = function(remove){
				if(_timeout) clearTimeout(_timeout);

				$pop.stop().fadeOut(300, function(){
					$pop[remove?"remove":"hide"]();
					if(opts.callback && typeof opts.callback.afterClose === "function") opts.callback.afterClose($pop);
				});
				
				if($("div.arpopups:visible").length<=1){
					$overlay.hide();
					
					//恢复窗口滚动
					$body.css({overflow:"auto"});
					$("html").css({"overflow-y":"auto"});
				}
        
        return $popups;
			}
			
			//设置弹窗的位置
			this.setPosition = function(){
				//设置弹窗定位
				var css = {};
				if(opts.position=="center"){
					css = {
						"left":"50%",
						"top":"50%",
						"margin-top":$win.scrollTop() - $pop.outerHeight() / 2,
						"margin-left":-$popups.outerWidth() / 2
						}
				}else{
					for(var aName in opts.position){
						conPosition[aName] = opts.position[aName];
					}
				}
				$pop.css(css);
				return $pop;
			}
			
			//拖拽弹窗
			 this.drag = function(){
				var dx, dy, moveout;
				var T = _content.find('div.arp-title').css('cursor', 'move');
				T.bind("selectstart", function(){
					return false;
				});
				
				T.mousedown(function(e){
					dx = e.clientX - parseInt(_content.css("left"));
					dy = e.clientY - parseInt(_content.css("top"));
					_content.mousemove(move).mouseout(out).css('opacity', 0.8);
					T.mouseup(up);
				});
	
				function move(e){
					moveout = false;
					if (e.clientX - dx < 0) {
						l = 0;
					}
					else 
						if (e.clientX - dx > $win.width() - _content.width()) {
							l = $win.width() - _content.width();
						}
						else {
							l = e.clientX - dx
						}
					_content.css({
						left: l,
						top: e.clientY - dy
					});
				}
				
				function out(e){
					moveout = true;
					setTimeout(function(){
						moveout && up(e);
					}, 10);
				}
				
				function up(e){
					_content.unbind("mousemove", move).unbind("mouseout", out).css('opacity', 1);
					T.unbind("mouseup", up);
				}
			}
			
			//Init
			this.init = function(){
				//遮罩层
			if(opts.overlay>0){
					if(!_$overlay[0]){
						$body.append('<div class="arp-overlay"/>');
						_$overlay = $('div.arp-overlay');
					}
					
					//禁止窗口滚动
					$body.css({overflow:"hidden"});
					if($.browser.msie && $.browser.version.substr(0,1) < 8) $("html").css({"overflow-y":"hidden"});
					
					//兼容IE6下select跑到背景层上的bug
				if($.browser.msie && $.browser.version.substr(0,1) < 7){
					_$overlay.append('<iframe src="javascript:false;document.write(\'\');" style="opacity:0"/>');
				}
					_$overlay.css({
						opacity : opts.overlay
					}).fadeIn(300).dblclick($.proxy(this.close,this));
				}
				$pop.show();
				
				//改变浏览器窗大小时重新计算弹窗位置
				$win.resize(setPosition)/*.scroll(setPosition)*/;
				
				
				//为内容里的关闭按钮绑定
				_content.show().find('.arp-close').click(function(){
					return arpClose(_content,opts.afterClose) || false; //回调返回true则执行浏览器默认操作
				});
				
				//按ESC关闭弹窗
				$(document).unbind('keydown.arpop').bind('keydown.arpop',function(e){
					if(e.keyCode === 27) arpClose(_content,opts.afterClose);
					return true
				});
				
				//是否可拖动
				if(opts.title && opts.drag) $pop.drag();
				
				//是否定时关闭
				if(opts.timeout){
					_timeout = setTimeout(function(){
						arpClose(_content,opts.afterClose);
					},opts.timeout);
				}
			}
			
			
			
			
			
			
			
			
			
			
			//触发事件
			if(opts.trigger=="auto"){
				showBox();
			}else{
				$pop[opts.trigger](function(){
					return showBox() || false; //回调返回true执行浏览器默认操作
				});
			}
				
			//输出关闭函数
			this.version = "1.3.0";
			return this;
			//});//=E .each()			
		}
	;
	$.fn.arPopups = {		
		defaults : {
				//imgURL:       "images/", //图片存放路径
				type:      "dialog", //窗口类型dialog,alert,confirm,prompt
				title:     "arPopups Title", //窗口标题
				trigger:      "click", //触发动作click,hover等,如为auto则自动显示
				buttons:   null,
				content:          null, //载入内容URL,@代表某一属性的值如@href,jq选择器则载入当前页面相应内容
				//filter:       null, //对加载URL内容进行筛选
				//requestType:  null, //iframe,ajax,img
				//requestData:  null, //requestType为ajax时向服务器传送的数据,使用时必须指定{dataType:html||json||jsonp||script||text}
				timeout:      0,
				drag:         true, //允许拖动,禁止拖动请设为false
				size:      null ,//设置窗口尺寸{width: 400,height: 300}
				position:     "center", //窗口显示位置
				class:      "", //弹窗class,如需更换请预先定制窗口样式
				overlay:      .5, //背景透明度
				//html:         "" //自定义弹出框内容
				callback:     null, //弹窗后执行的函数
			}
	}
})(jQuery);