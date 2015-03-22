/*
 *   jquery.arPopups.js
 *  ===========================
 *   v1.2.8 [2013.05.16]
 *  ===========================
 *   power by Aaron 
 *   Aaron.xiexie@gmail.com
 */
;(function($){
    var $B; //$B半透明层
	$.fn.extend({
		arPopups : function(options){
			var defaults = {
				imgURL:       "images/", //图片存放路径
				trigger:      "click", //触发动作click,hover等,如为auto则自动显示
				popwrap:      "", //弹窗class,如需更换请预先定制窗口样式
				overlay:      .5, //背景透明度
				callback:     null, //弹窗后执行的函数
				afterClose:   null,
				position:     "center", //窗口显示位置
				timeout:      0,
				url:          null, //载入内容URL,@代表某一属性的值如@href,jq选择器则载入当前页面相应内容
				filter:       null, //对加载URL内容进行筛选
				requestType:  null, //iframe,ajax,img
				requestData:  null, //requestType为ajax时向服务器传送的数据,使用时必须指定{dataType:html||json||jsonp||script||text}
				poptype:      "dialog", //窗口类型dialog,alert,confirm,prompt
				poptitle:     "arPopups Title", //窗口标题
				drag:         true, //允许拖动,禁止拖动请设为false
				popsize:      null ,//设置窗口尺寸{width: 400,height: 300}
				html:         "" //自定义弹出框内容
			};
			var opts = $.extend({},defaults,$.arPopups.param,options);
			//return this.each(function(){
			var $ths = this;
			var $win = $(window);
			var $body = $("body");
			var timeOuter , $C; //$C弹窗内容
			var arpHtml = '<div class="arpopups'+($.trim(opts.popwrap) ? " "+opts.popwrap : "")+'">\n'
							+'<div class="arp-close"><span>Close</span></div>\n' 
							+(!opts.poptitle ? '' : '<div class="arp-title"><span>' + opts.poptitle + '</span></div>\n') 
							+'<div class="arp-content"/>\n'
						  +'</div>';
			
			//弹窗函数
			function showBox(){
				//写入html
				if(opts.overlay>0){
					if(!$B){
						$body.append('<div class="arp-overlay"/>');
						$B = $('div.arp-overlay'); //半透明层
					}else{
						$body.append($B);
					}
					$B.fadeIn(300).dblclick(function(){
						arpClose($("div.arpopups"),opts.afterClose);
					});
				}
				if(!$C) $C = $(arpHtml); //内容层
				$body.append($C);
				
				if(opts.filter){
					$C.attr("id","arp_"+opts.filter.substring(1));
				}
								
				if($.browser.msie && $.browser.version.substr(0,1) < 7){
					if($B) $('<iframe src="javascript:false;document.write(\'\');" class="ie6iframe"></iframe>').css({opacity:0}).appendTo($B);//兼容IE6下select跑到背景层上的bug
					$.getScript(imgURL+"DD_belatedPNG.js",function(){							
						DD_belatedPNG.fix('.ie6png');
					});
					$C.find("div.arp-close").addClass("ie6png");//兼容IE6下显示png图片的bug
				}
				return handleClick();
			}
			
			//处理加载数据
			function handleClick(){
				var $con = $C.find("div.arp-content");
				var $title = $C.find('div.arp-title');
				if(opts.url){
					var loadUrl = typeof(opts.url)=="String" && opts.url.substring(0,1)==="@" ? $ths.attr(opts.url.substring(1)) : opts.url;
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
								if(opts.popsize!=null){
									ifr.css({
										width:opts.popsize.width - parseInt($con.css("padding-left"))*2,
										height:opts.popsize.height ? opts.popsize.height - $title.outerHeight() - parseInt($con.css("padding-top"))*2 : $win.height()/2
									});
								}else{
									var $it = $(this).contents();
									var fH = $it.height();//iframe height
									var fW = $it.width();
									var newW = Math.min($win.width() - 40, fW);
									var newH = $win.height() - 25 - (!opts.poptitle ? 0 : 30);
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
				}else if(opts.html){//定制html内容
					$con.html(opts.html);
					return afterHandleClick();
				}else{
					$ths.clone(true).appendTo($con.empty()).show();
					return afterHandleClick();
				}
			}
			
			//处理点击之后的处理
			function afterHandleClick(){
				setPosition();
				
				//改变浏览器窗大小时重新计算弹窗位置
				$win.resize(setPosition)/*.scroll(setPosition)*/;
				
				//禁止窗口滚动
				if($B){
					$body.css({overflow:"hidden"});
					if($.browser.msie && $.browser.version.substr(0,1) < 8) $("html").css({"overflow-y":"hidden"});
				}
				
				//为内容里的关闭按钮绑定
				$C.show().find('.arp-close').click(function(){
					return arpClose($C,opts.afterClose) || false; //回调返回true则执行浏览器默认操作
				});
				
				//按ESC关闭弹窗
				$(document).unbind('keydown.arpop').bind('keydown.arpop',function(e){
					if(e.keyCode === 27) arpClose($C,opts.afterClose);
					return true
				});
				
				//是否可拖动
				if(opts.poptitle && opts.drag) drag();
				
				//是否定时关闭
				if(opts.timeout){
					timeOuter = setTimeout(function(){
						arpClose($C,opts.afterClose);
					},opts.timeout);
				}
				
				//for IE6表单样式
				if($.browser.msie && $.browser.version.substr(0,1) < 7){
					$("input:text,input:password").addClass("input-txt");
				}
				
				//回调函数
				if(typeof(opts.callback) === 'function') return opts.callback($ths,$C);
			}
			
			//设置弹窗的位置
			function setPosition(){
				if(!$C[0]) return false;
				var docHeight = Math.max($body.height(), $win.height());//页面高度
				
				//设置透明层样式
				if($B){
					$B.css({
						width : '100%',
						height : docHeight,					
						opacity : opts.overlay
					});
				}
				
				//设置弹窗尺寸
				if(opts.popsize){
					$C.css({
						width:opts.popsize.width,
						height:opts.popsize.height
					});

				}
				
				//设置弹窗定位
				var conPosition = {};
				if(opts.position=="center"){
					conPosition["left"] = $win.scrollLeft()+($win.width()-$C.outerWidth())/2;
					conPosition["top"] = $win.scrollTop()+($win.height()-$C.outerHeight())/2;
				}else{
					for(var aName in opts.position){
						conPosition[aName] = opts.position[aName];
					}
				}
				$C.css(conPosition);
			}
			
			//拖拽弹窗
			function drag(){
				var dx, dy, moveout;
				var T = $C.find('div.arp-title').css('cursor', 'move');
				T.bind("selectstart", function(){
					return false;
				});
				
				T.mousedown(function(e){
					dx = e.clientX - parseInt($C.css("left"));
					dy = e.clientY - parseInt($C.css("top"));
					$C.mousemove(move).mouseout(out).css('opacity', 0.8);
					T.mouseup(up);
				});
	
				function move(e){
					moveout = false;
					if (e.clientX - dx < 0) {
						l = 0;
					}
					else 
						if (e.clientX - dx > $win.width() - $C.width()) {
							l = $win.width() - $C.width();
						}
						else {
							l = e.clientX - dx
						}
					$C.css({
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
					$C.unbind("mousemove", move).unbind("mouseout", out).css('opacity', 1);
					T.unbind("mouseup", up);
				}
			}
			
			//关闭弹出框函数
			function arpClose(arpop,callback){
				var $arpop = arpop || $C;
				if(!$arpop[0]) return false;
				if(timeOuter) clearTimeout(timeOuter);
				if($B && $arpop.length>=$("div.arpopups").length){//判断当前窗口数量决定是否移除半透明层
					$B.remove();
					
					//恢复窗口滚动
					$body.css({overflow:"auto"}); 
					if($.browser.msie && $.browser.version.substr(0,1) < 8) $("html").css({"overflow-y":"auto"});
				}
				$arpop.stop().fadeOut(300, function(){
					$arpop.remove();
					if(typeof(callback) === "function") callback();
				});
			}
			
			
			//触发事件
			if(opts.trigger=="auto"){
				showBox();
			}else{
				$ths[opts.trigger](function(){
					return showBox() || false; //回调返回true执行浏览器默认操作
				});
			}
				
			//输出关闭函数
			$.arPopups.close = arpClose;
			return this;
			//});//=E .each()			
		}
	});
	$.arPopups = {		
		param:{},
		//可外部修改的默认属性
		defaults:function(o){
			$.extend($.arPopups.param,o);
		}
	}
})(jQuery);