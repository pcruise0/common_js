/*

	>> Load Excel data
	
		: Number of Piers
		: Stage 
		: System
		: Camber data
		: Measured data
		
	>> 

*/

var astage 		= [];	// 시공단계
var astagedef	= [];	// 시공단계별 처짐
var astagecam	= [];	// 시공단계별 캠버
var astage_cam_g_long	= [];	// 시공단계별 거더 캠버 longi
var astage_cam_g_tran	= [];	// 시공단계별 거더 캠버 trans
var astage_cam_g_elev	= [];	// 시공단계별 거더 캠버 elev
var astage_cam_p_long	= [];	// 시공단계별 주탑 캠버 longi
var astage_cam_p_tran	= [];	// 시공단계별 주탑 캠버 trans
var astage_cam_p_elev	= [];	// 시공단계별 주탑 캠버 elev
var astage_cab		= [];	// 시공단계별 케이블장력, 허용장력, 도입장력
var astagemea	= [];	// 시공단계별 측량

var aprojinfo	= [ 'A127889', '의령낙동대교'];
var sfile_xlsx	= 'CSBGEOCON_R00_A127889.xlsx'
var stargetid 	= 'xls_data';
var axlsx_keys = [ 	[ "INFO", "STAGE"	, "END"], 
					[ "STAGE", "STAGE"	, "END"],
					[ "STAGE_CAM_G_ELEV", "SPAN"	, "END"],
					[ "STAGE_CAM_P_LONG", "SPAN"	, "END"],
					[ "STAGE_CAB", "SPAN"	, "END"]
				];

// local date
var sdate = new Date().toISOString().split('T')[0];


// chart option
var plotly_layout_gird = {
	
	xaxis: {
		//range: [ 0.75, 5.25 ]
		showline: true,
		mirror: true,
		//tickformat :".3f",
		ticks: 'outside',
		title: "<i>STATION(M)</i>"
	},

	yaxis: {
		//range: [0, 8]
		showline: true,
		mirror: true,
		//tickformat :".3f",
		ticks: 'outside',
		title: "<i>Camber(MM)</i>"
	},

	showlegend: false,

//			
//			legend: {
//				x: 0.5,
//				y: -0.3,
//				"orientation": "h",
//				"yanchor":'top',
//				"xanchor":'center'
//			},

//			title: 'CAMBER',

//	modebar: {
//			  // vertical modebar button layout
//		  orientation: "h",  // or 'v'
//			  // for demonstration purposes
//			  bgcolor: 'salmon'
//			  color: 'white',
//			  activecolor: '#9ED3CD'
//	},

	margin: {
		l: 100,
		r: 50,
		b: 50,
		t: 20
		//pad: 4
	}			
	
};

var plotly_layout_cable = {
	
	xaxis: {
		//range: [ 0.75, 5.25 ]
		showline: true,
		mirror: true,
		//tickformat :".3f",
		ticks: 'outside',
		tickangle: -45,
		title: "<i>Cable</i>"
	},

	yaxis: {
		//range: [0, 8]
		showline: true,
		mirror: true,
		//tickformat :".3f",
		ticks: 'outside',
		title: "<i>Force(kN)</i>"
	},

	showlegend: false,

	barmode: 'group',
	
	margin: {
		l: 100,
		r: 50,
		b: 50,
		t: 20
		//pad: 4
	}			
	
};

var plotly_config= {		// modebar option
	displaylogo: false,
	displayModeBar: false,	
	scrollZoom: true,
	modeBarButtonsToRemove: ['zoom2d','zoomIn2d', 'zoomOut2d','select2d','lasso2d', 
	                          'toggleSpikelines', 'hoverClosestCartesian','hoverCompareCartesian', 'resetScale2d' ]	// 'pan2d',	'autoScale2d' 
	
};


// var astageact	= [];	// 시공단계별 처짐, activation 필요 없음... 엑셀에서 처리

var mod_A127889 = new function(){

						//
						// STAGE_CAM_G_(L / T / E)
						// STAGE_CAM_P_(L / T / E)
						// STAGE_CAB
						//
						//[ "STAGE_ACT", "SPAN"	, "END"] ,
						//[ "STAGE_MEA", "SPAN"	, "END"] 
	
	var ainfo 		= [];
	
	var acamber		= [];
	var astation	= [];

	var apart		= [];
	var aseg		= [];
	var aelem		= [];
	var aelemij		= [];
	var aelev		= [];
	var adef		= [];		// 단계별 처짐
	var aft			= [];		// FT 탄성처짐
	var acam		= [];		// 단계별 캠버
	var aact		= [];		// 1 activation
//	var amea_cam	= [];		// 단계별 측량 (캠버)
//	var asyml		= [];		// 좌측 심볼
//	var asymc		= [];		// 중앙 심볼
//	var asymr		= [];		// 우측 심볼
	
	var acamcorr	= [];
	var abfcast		= [];
	
	var sdiv_res = 'content'; 

	this.load_form 	= function(){

		// ***********************************************************************************
		// DEFAULT HEADER
		// ***********************************************************************************
		var starget	= 'header';
		var odiv = document.getElementById( starget );

		var shtml = '';

		shtml += "		<div style='display:table-cell; vertical-align: bottom; width:400px; height:100%; font-size:2.0em;'>";
		shtml += "			<span style='width:320px; font-family:\"stencil\" ;' >" + aprojinfo[1] + " </span> ";
		//shtml += "			<span style='width:320px; font-family:\"stencil\" ;' >" + 'MCRP' + " </span> ";
		shtml += "		</div>";
		shtml += "		<div id = 'menubot' style='display:table-cell; width:600px; vertical-align: bottom; text-align:center;'>";
		shtml += "		</div>";
		
		shtml += "		<div style='display:table-cell; width:200px; margin:0;'>";
		shtml += "			<span style='width:100%; text-align:center; '>";
		shtml += "				<img style='margin:0; padding:0;'src = '/figure/cowilogo.png'  style='display:block;'  height='30px'></img>";
		shtml += "			</span>";
		shtml += "			<span style='width:100%; text-align:center; '>";
		shtml += "				<i>Developed by Youngjin Park</i>";
		shtml += "			</span>";
		shtml += "		</div>";

		odiv.innerHTML = shtml;
		
	}
	
	this.load_data	= function( ){

		document.getElementById( stargetid ).innerHTML = "";	

		// see JS/module_xlsx
		read_xlsx_server( sfile_xlsx, stargetid, axlsx_keys );  
		
		// save into array
		var owait = 	setInterval( function(){		
		
								var scontent = document.getElementById( stargetid ).innerHTML;

								if ( scontent.length !=0 ){
									
									clearInterval(owait);

									var ainput = scontent.split('<br>');	// div 내부로 출력된 내용은 <br>로 바뀜!!
									
									astage 	= [];
									ainfo 	= [];
									astagedef	= [];
									astagecam	= [];
									astageact	= [];
									astagecamPY1=[]; //
									
									
									
									//
									for( var i = 0; i < ainput.length; i++ ){
										
										var aline = ainput[ i ].split( '!!' );
																				
										if( ainput[i].length != 0 ){
											
											if( aline[ 0 ].toUpperCase() == 'INFO' ){
												
												ainfo.push( aline );
												
											} else if( aline[ 0 ].toUpperCase() == 'STAGE' ){
												
												astage.push( aline );
												
											} else if( aline[ 0 ].toUpperCase() == 'STAGE_CAM_G_ELEV' ){
												
												astage_cam_g_elev.push( aline );
																								
											} else if( aline[ 0 ].toUpperCase() == 'STAGE_CAM_P_LONG' ){
												
												astage_cam_p_long.push( aline );											

											} else if( aline[ 0 ].toUpperCase() == 'STAGE_CAB' ){
												
												astage_cab.push( aline );											
											
											}
											
										}
																				
									}
								
									mod_menubar( 'info' )
																											
								} 
								
							}	, 200);		// check every 0.2 seconds
							
							//mod_menubar( 'info' ); // just for test
				
	}

	this.show_geocon = function(  ){

		var starget	= 'content';
		var odiv = document.getElementById( starget );

		var shtml = '';

/*
	STAGE Drop down
*/

		shtml += "		<div>";
		shtml += "			<span style='width : 200px' >";
		shtml += "				<ul class='img_square'>" ;
		shtml += "					<li >" ;
		shtml += "					SELECT STAGE";
		shtml += "					</li>" ;
		shtml += "				</ul>";
		shtml += "			</span>";
		shtml += "			<span style='width : 800px; '>";
		shtml += "				<div style='width:500px; margin:auto; ' id='stage' ></div> ";
		shtml += "			</span>";
		shtml += "		</div>";
/*
	CHART
*/
		shtml += "	<ul class='img_square' >" ;
		shtml += "		<li >" ;
		shtml += "		CHART";
		shtml += "		</li>" ;
		shtml += "	</ul>";

		shtml += "	<ul class='img_check'>" ;
		shtml += "		<li style='text-align:left;'>" ;
		shtml += "			GIRDER";
		shtml += "		</li >" ;
		shtml += "	</ul >" ;

		shtml += "	<div id='plotlychart_gird' style='width:1100px; height:350px;' >";
		shtml += "	</div>";

		shtml += "	<ul class='img_check' >" ;
		shtml += "		<li style='text-align:left;'>" ;
		shtml += "			PYLON";
		shtml += "		</li >" ;
		shtml += "	</ul >" ;

		// 주탑의 경우 5개 자리를 미리 만들어놓고 activation 하자
		shtml += "	<div id='plotlychart_pylon' style='width:1100px; height:500px; display:inline-block; text-align:center;'>";
		shtml += "		<div id='plotlychart_pylon_1' style='width:0px; height:450px; display:none;'></div>";
		shtml += "		<div id='plotlychart_pylon_2' style='width:0px; height:450px; display:none;'></div>";
		shtml += "		<div id='plotlychart_pylon_3' style='width:0px; height:450px; display:none;'></div>";
		shtml += "		<div id='plotlychart_pylon_4' style='width:0px; height:450px; display:none;'></div>";
		shtml += "		<div id='plotlychart_pylon_5' style='width:0px; height:450px; display:none;'></div>";
		shtml += "	</div>";

		shtml += "	<ul class='img_check'>" ;
		shtml += "		<li style='text-align:left;'>" ;
		shtml += "			CABLE FORCE";
		shtml += "		</li >" ;
		shtml += "	</ul >" ;

		shtml += "	<div id='plotlychart_cable' style='width:1100px; height:300px;'>";
		shtml += "	</div>";


/*
	TABLE Girder / Pylon / Cable
*/

		shtml += "	<ul class='img_square'>" ;
		shtml += "		<li >" ;
		shtml += "		TABLE";
		shtml += "		</li>" ;
		shtml += "	</ul>";
		
		// Table Girder
//		shtml += "	<div >";
//		shtml += "		<span style='width:200px; margin-left:2.0em;' > <ol start='3' style='font-size:1.0em; font-weight:bold;'><li>GIRDER CAMBER TABLE</li></ol> </span> ";
//		shtml += "	</div >";
		shtml += "	<ul class='img_check'>" ;
		shtml += "		<li style='text-align:left;'>" ;
		shtml += "			GIRDER";
		shtml += "		</li >" ;
		shtml += "	</ul >" ;

		shtml += "	<div id='env_girder_table' style='width:1100px; overflow-x: auto; margin-Bottom:20px;'>";
		shtml += "		<table id='girder_camber_table'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";

		// Table Pylon
		shtml += "	<ul class='img_check'>" ;
		shtml += "		<li style='text-align:left;'>" ;
		shtml += "			PYLON";
		shtml += "		</li >" ;
		shtml += "	</ul >" ;
		
//		shtml += "	<div >";
//		shtml += "		<span style='width:200px; margin-left:2.0em;' > <ol start='3' style='font-size:1.0em; font-weight:bold;'><li>PYLON CAMBER TABLE</li></ol> </span> ";
//		shtml += "	</div >";
		shtml += "	<div id='env_pylon_table1' style='width:0px; overflow-x: auto; margin-Bottom:20px; display:none;'>";
		shtml += "		<table id='pylon_camber_table1' style='width:0px; height:450px; display:none;'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";
		shtml += "	<div id='env_pylon_table2' style='width:0px; overflow-x: auto; margin-Bottom:20px; display:none;'>";
		shtml += "		<table id='pylon_camber_table2' style='width:0px; height:450px; display:none;'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";
		shtml += "	<div id='env_pylon_table3' style='width:0px; overflow-x: auto; margin-Bottom:20px; display:none;'>";
		shtml += "		<table id='pylon_camber_table3' style='width:0px; height:450px; display:none;'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";
		shtml += "	<div id='env_pylon_table4' style='width:0px; overflow-x: auto; margin-Bottom:20px; display:none;'>";
		shtml += "		<table id='pylon_camber_table4' style='width:0px; height:450px; display:none;'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";
		shtml += "	<div id='env_pylon_table5' style='width:0px; overflow-x: auto; margin-Bottom:20px;display:none;'>";
		shtml += "		<table id='pylon_camber_table5' style='width:0px; height:450px; display:none;'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";

		// Table cable force
		shtml += "	<ul class='img_check'>" ;
		shtml += "		<li style='text-align:left;'>" ;
		shtml += "			CABLE FORCE";
		shtml += "		</li >" ;
		shtml += "	</ul >" ;
//		
//		shtml += "	<div >";
//		shtml += "		<span style='width:200px; margin-left:2.0em;' > <ol start='3' style='font-size:1.0em; font-weight:bold;'><li>CABLE FORCE TABLE</li></ol> </span> ";
//		shtml += "	</div >";
		shtml += "	<div id='env_cable_table' style='width:1100px; overflow-x: auto; margin-Bottom:20px; '>";
		shtml += "		<table id='cable_force_table'>	";
		shtml += "		</table>	";		
		shtml += "	</div >";

		odiv.innerHTML = shtml;

/*
	TABLE / FORM SETTING
*/
//		shtml += "	<div >";
//		shtml += "		<span style='width:200px; margin-left:2.0em;' > <ol start='3' style='font-size:1.0em; font-weight:bold;'><li>CAMBER TABLE</li></ol> </span> ";
//		shtml += "	</div >";
//
//		shtml += "	<div id='camber_env' style='width:1100px; overflow-x: auto; margin-Bottom:20px; '>";
////		shtml += "		<table id='camber_table'>	";
////		shtml += "		</table>	";		
//		shtml += "	</div >";
//
//		// Form Setting Sheet
//		//		FT 탄성처짐
//		//		20mm 초과시 보정치
//		//		캠버..
//		//		각 캔틸레버 끝단의 형상을 보여주는 것도 좋을듯.. (추후에..) 서식 만드는것이 우선.
//		shtml += "	<div >";
//		shtml += "		<span style='width:200px; margin-left:2.0em;' > <ol start='4' style='font-size:1.0em; font-weight:bold;'><li> FORM SETTING  </li></ol></span> ";
//		shtml += "	</div >";
//
//		shtml += "	<div id='formsetting' style='width:100%; height:300px; margin-Bottom:30px;'>";
//		shtml += "	</div>";
//		


		/* drop down menu */
		shtml = "";

		shtml += '<div class="selectBox2 ">';
		shtml += '  <input class="label" id="curstage" readonly="readonly" style="width:600px" onclick="mod_A127889.selectstage( \" 0 \" ) value="' + astage[0][1] + " : " + astage[0][2]+ '"></input>';
		shtml += '  <ul class="optionList">';
		for( var i = 0; i < astage.length; i++ ){
			var sval =  astage[i][1] + " : " + astage[i][9];

			shtml += "<li class='optionItem' onclick='mod_A127889.selectstage( \" ";
			shtml += i ;
			shtml += " \" );' >" + sval + "</li>";
			
		} 
	
		shtml += '  </ul>';
		shtml += '</div>';

//		shtml += '<div class="dropdown" style="width:600px; ">';
//		shtml += '  <input id="curstage" readonly="readonly" onclick="mod_A127889.selectstage( \" 0 \" )" style="width:600px" value="' + astage[0][1] + " : " + astage[0][2]+ '"></input>'; //astage[0][2]		
//		shtml += '  <div id="stagelist" class="dropdown-content" style="height:500px; overflow-x:hidden;">';
//		
//			
//		for( var i = 0; i < astage.length; i++ ){
//			var sval =  astage[i][1] + " : " + astage[i][9];
//			shtml += "<span onclick='mod_A127889.selectstage( \" ";
//			shtml += i ;
//			shtml += " \" );' >" + sval + "</span>";
//		} 
//				
//		shtml += '  </div>';
//		shtml += '</div>';
//
////		shtml += "	<span style='width:200px; margin-left:2.0em;' > (Click to Change) </span> ";
//		
		document.getElementById( 'stage' ).innerHTML = shtml;		

		/* stage dropdown activator */

		var label = document.getElementById( 'curstage' );

		var options = document.querySelectorAll('.optionItem');

		var handleSelect = function(item) {
		  label.innerHTML = item.textContent;
		  label.parentNode.classList.remove('active');
		}

		options.forEach(function(option){
		  option.addEventListener('click', function(){handleSelect(option)})
		})

		label.addEventListener('click', function(){
		  if(label.parentNode.classList.contains('active')) {
			label.parentNode.classList.remove('active');
		  } else {
			label.parentNode.classList.add('active');
			label.parentNode.style.zIndex = 999;
		  }
		});

		/* ----------------------------------- */

		mod_A127889.selectstage( 0 );

	}

	this.selectstage = function( iposi ){
		
		// 1. draw chart
		// 2. draw table
		// 3. form setting sheet
				
		//alert( "aa : stagedef " + astagedef.length );
		//document.getElementById( "constg" ).onclick();
		iposi = iposi *1;
		var sstage = astage[iposi][1];	// 선택된 Stage 이름
		
		// 0. change input text
		var sstagename = astage[iposi][1] + " : " + astage[iposi][9];
		document.getElementById('curstage').value = sstagename;


/*
	GIRDER CAMBER CHART
*/						
		chart_girder( 'plotlychart_gird', astage_cam_g_elev, sstage );

/*
	PYLON CAMBER CHART
*/						
		// pylon 갯수만큼 반복

		var apylon = [];		
		// pylon 갯수 산정
		var apart		= get_array_hlook( astage_cam_p_long, 0, "PART") ;	// 첫번째 컬럼의 키워드 데이터는 빼고 불러옴		

		for( var i = 0; i < apart.length; i++ ){
			
			if( i == 0 ){
				
				apylon.push( apart[ i ] );
				
			} else {
				
				if( apart[ i - 1] != apart[ i ] ){
					
					apylon.push( apart[ i ] );
					
				}				
			}
		}

		// pylon chart plot
		var sdiv, sdiv_env;
		for( var i = 0; i < apylon.length; i++ ){
			
			sdiv = 'plotlychart_pylon_' + (i + 1);

			document.getElementById( sdiv ).style.width = '300px';		
			document.getElementById( sdiv ).style.display = 'inline-block';		

			chart_pylon( sdiv, astage_cam_p_long, apylon[ i ], sstage );
			
		}

/*
	CABLE FORCE CHART
*/						
		chart_cable( 'plotlychart_cable', astage_cab, sstage );


/*
	GIRDER CAMBER TABLE
*/						

		table_girder( 'env_girder_table', 'girder_camber_table', astage_cam_g_elev, sstage );

/*
	PYLON CAMBER TABLE
*/						

		for( var i = 0; i < apylon.length; i++ ){

			sdiv_env = 'env_pylon_table' + (i + 1);
			sdiv = 'pylon_camber_table' + (i + 1);

			document.getElementById( sdiv_env ).style.width = '1100px';		
			document.getElementById( sdiv_env ).style.display = 'inline-block';		

			table_pylon( sdiv_env, sdiv, astage_cam_p_long, apylon[ i ], sstage );

		}

/*
	CABLE FORCE TABLE
*/						

		table_cable( 'env_cable_table', 'cable_force_table', astage_cab, sstage );


		alert( "STAGE : " + sstagename + "  selected!" );


	}

	this.show_info = function( ){

		var starget	= 'content';

		var atable_data = [];
		
		for( var i = 0; i < ainfo.length; i++ ){		// 첫번째 데이터는 삭제
			var atemp = [];
			atemp[0] = ainfo[i][1];
			atemp[1] = ainfo[i][2];
			atable_data.push( atemp );
		}
		
		var acolsize = [];
		acolsize[0] = 200;
		acolsize[1] = 600;
		
		var itable_width = 800;
		
		mod_table.table_create( starget, 'proj_info', itable_width, acolsize, '', atable_data );
		
	}

	this.show_stage = function(){

		var starget	= 'content';
		var odiv = document.getElementById( starget );
		
		// envelope 생성
		starget	= 'stage_env';

		var shtml = '';

		shtml += "<div id='" + starget + "' style='width :1200px; height : 700px; overflow-y:scroll;'>";
		odiv.innerHTML = shtml;
		
		// create table
		var atable_header = [];
			var atemp = [];
			atemp[0] = 'STAGE ID';
			atemp[1] = 'PY1주탑';
			atemp[2] = 'PY1거더';
			atemp[3] = 'PY1케이블';
			atemp[4] = 'PY2주탑';
			atemp[5] = 'PY2거더';
			atemp[6] = 'PY2케이블';
			atemp[7] = '기타';
		
		atable_header.push( atemp );
		
		var atable_data = [];

		for( var i = 0; i < astage.length; i++ ){
			
			var atemp = [];
			atemp[0] = astage[i][1];
			atemp[1] = astage[i][2];
			atemp[2] = astage[i][3];
			atemp[3] = astage[i][4];
			atemp[4] = astage[i][5];
			atemp[5] = astage[i][6];
			atemp[6] = astage[i][7];
			atemp[7] = astage[i][8];
			
			atable_data.push( atemp );
			
		} 

		var acolsize = [];
		acolsize[0] = 100;
		acolsize[1] = 100;
		acolsize[2] = 100;
		acolsize[3] = 100;
		acolsize[4] = 100;
		acolsize[5] = 100;
		acolsize[6] = 100;
		acolsize[7] = 300;
		
		var itable_width = 1100;

		mod_table.table_create( starget, 'stage_info', itable_width, acolsize, atable_header, atable_data );
		
		document.getElementById('stage_info').rows[0].style='position:sticky; top:0;';
//		mod_table.fixedhead('stage_info');
		
	}

}

function table_cable( sdiv_env, sdiv_target, adata_cam, sstage ){

	var aname		= get_array_hlook( adata_cam, 0, "NAME") ;
	var aforce_0	= get_array_hlook( adata_cam, 0, "T0") ;
	var aforce_stg	= get_array_hlook( adata_cam, 0, sstage) ;


	var atable_header = [];;
	var atemp = [];
	atemp[0] = "CABLE ID";
	for( var i = 0; i < aname.length; i++){
		atemp.push( aname[i] );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "T0 (kN)";
	for( var i = 0; i < aforce_0.length; i++){
		atemp.push( (aforce_0[i] * 1.0).toFixed(3)  );
	}
	atable_header.push( atemp );



	// 시공단계별 데이터
	var atable_data = [];
	atemp = [];
	atemp[0] = "FORCE (kN)";
	for( var i = 0; i < aforce_stg.length; i++){
		
		if( aforce_stg[i].length != 0 ){
			
			atemp.push( (aforce_stg[i] * 1.0).toFixed(3) );
			
		} else {
			
			atemp.push( "-" );
			
		}
	}
	atable_data.push( atemp );


	var acolsize = [];
	for( var i = 0; i < aname.length + 1; i++){
		if( i == 0 ){
			acolsize[i] = 100;				
		} else {
			acolsize[i] = 60;
		}
	}
	
	// camber table
	mod_table.table_create( sdiv_env, sdiv_target, '', acolsize, atable_header, atable_data );

}

function table_pylon( sdiv_env, sdiv_target, adata_cam, spart, sstage ){

	var apart		= get_array_hlook( adata_cam, 0, "PART") ;	// 첫번째 컬럼의 키워드 데이터는 빼고 불러옴
	var aseg		= get_array_hlook( adata_cam, 0, "LOT") ;
	var aelem		= get_array_hlook( adata_cam, 0, "ELEM") ;
	var aelemij		= get_array_hlook( adata_cam, 0, "IJ") ;
	var aelev		= get_array_hlook( adata_cam, 0, "ELEV") ;
	var acamber		= get_array_hlook( adata_cam, 0, "Camber") ;
	var acam		= get_array_hlook( adata_cam, 0, sstage) ;	// 단계별 처짐값

	var atable_header = [];;
	var atemp = [];
	atemp[0] = "PYLON";
	for( var i = 0; i < apart.length; i++){
		if( apart[i].toUpperCase() == spart.toUpperCase() ){
			atemp.push( apart[i] );
		}
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "LOT";
	for( var i = 0; i < aseg.length; i++){
		if( apart[i].toUpperCase() == spart.toUpperCase() ){
			atemp.push( aseg[i] );
		}
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "ELEM";
	for( var i = 0; i < aelem.length; i++){
		if( apart[i].toUpperCase() == spart.toUpperCase() ){
			atemp.push( aelem[i] );
		}
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "IJ";
	for( var i = 0; i < aelemij.length; i++){
		if( apart[i].toUpperCase() == spart.toUpperCase() ){
			atemp.push( aelemij[i] );
		}
	}
	atable_header.push( atemp );
		
	atemp = [];
	atemp[0] = "ELEV (M)";
	for( var i = 0; i < aelev.length; i++){
		if( apart[i].toUpperCase() == spart.toUpperCase() ){
			atemp.push( ( aelev[i] * 1 ).toFixed(3) );
		}
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "T.CAMB(MM)";
	for( var i = 0; i < acamber.length; i++){
		if( apart[i].toUpperCase() == spart.toUpperCase() ){
			atemp.push( (acamber[i] * 1 ).toFixed(0) );
		}
	}
	atable_header.push( atemp );

	// 시공단계별 데이터
	var atable_data = [];
	atemp = [];
	atemp[0] = "Theo.CAMB";
	for( var i = 0; i < acam.length; i++){

		if( apart[i].toUpperCase() == spart.toUpperCase() ){
		
			if( acam[i].length != 0 ){
				
				atemp.push( (acam[i] * 1.0).toFixed(3) );
				
			} else {
				
				atemp.push( "-" );
				
			}
		}
	}
	atable_data.push( atemp );
	
	var acolsize = [];
	for( var i = 0; i < atemp.length + 1; i++){
		if( i == 0 ){
			acolsize[i] = 100;				
		} else {
			acolsize[i] = 60;
		}
	}
	
	// camber table
	mod_table.table_create( sdiv_env, sdiv_target, '', acolsize, atable_header, atable_data );


}

function table_girder( sdiv_env, sdiv_target, adata_cam, sstage ){
	
	var apart		= get_array_hlook( adata_cam, 0, "PART") ;	// 첫번째 컬럼의 키워드 데이터는 빼고 불러옴
	var aseg		= get_array_hlook( adata_cam, 0, "SEG") ;
	var aelem		= get_array_hlook( adata_cam, 0, "ELEM") ;
	var aelemij		= get_array_hlook( adata_cam, 0, "IJ") ;
	var astation	= get_array_hlook( adata_cam, 0, "Station") ;
	var aelev		= get_array_hlook( adata_cam, 0, "ELEVC") ;
	var aft			= get_array_hlook( adata_cam, 0, "FT") ;
	var acamber		= get_array_hlook( adata_cam, 0, "Camber") ;
	var acam		= get_array_hlook( adata_cam, 0, sstage) ;	// 단계별 처짐값

	var atable_header = [];;
	var atemp = [];
	atemp[0] = "PART";
	for( var i = 0; i < apart.length; i++){
		atemp.push( apart[i] );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "SEG";
	for( var i = 0; i < aseg.length; i++){
		atemp.push( aseg[i] );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "ELEM";
	for( var i = 0; i < aelem.length; i++){
		atemp.push( aelem[i] );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "IJ";
	for( var i = 0; i < aelemij.length; i++){
		atemp.push( aelemij[i] );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "STATION (M)";
	for( var i = 0; i < astation.length; i++){
		atemp.push( astation[i] );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "ELEV (M)";
	for( var i = 0; i < aelev.length; i++){
		atemp.push( ( aelev[i] * 1 ).toFixed(3) );
	}
	atable_header.push( atemp );
	
	atemp = [];
	atemp[0] = "T.CAMB(MM)";
	for( var i = 0; i < acamber.length; i++){
		atemp.push( (acamber[i] * 1 ).toFixed(0) );
	}
	atable_header.push( atemp );

	// 시공단계별 데이터
	var atable_data = [];
	atemp = [];
	atemp[0] = "Theo.CAMB";
	for( var i = 0; i < acam.length; i++){
		
		//if( aact[i].toUpperCase() == "A" || aact[i].toUpperCase() == "N" ){
		//if( aact[i].toUpperCase() == "A" ){
		if( acam[i].length != 0 ){
			
			atemp.push( (acam[i] * 1.0).toFixed(3) );
			
		} else {
			
			atemp.push( "-" );
			
		}
	}
	atable_data.push( atemp );

	atemp = [];
	atemp[0] = "Theo.ELEV";
	for( var i = 0; i < acam.length; i++){
		
		//if( aact[i].toUpperCase() == "A" || aact[i].toUpperCase() == "N" ){
		if( acam[i].length != 0 ){
			
			atemp.push( ( aelev[i] * 1 + acam[i] / 1000 ).toFixed(3) );
			
		} else {
			
			atemp.push( "-" );
		}			
	}
	atable_data.push( atemp );

	//// activation test
	//atemp = [];
	//atemp[0] = "ACTIVATION";
	//for( var i = 0; i < apart.length; i++){
	//	
	//	//if( aact[i].toUpperCase() == "A" ){
	//		
	//		atemp.push( aact[i] );
	//	
	//	//}
	//}
	//atable_data.push( atemp );
	
	// 측량결과
	//if( amea ){
//		atemp = [];
//		atemp[0] = "AsB.CAMB";
//		for( var i = 0; i < apart.length; i++){
//			if( amea.length == 0 || amea[i].length == 0  ){
//				atemp.push( "-" );
//
//			} else {
//				atemp.push( (( amea[i]*1 - aelev[i]*1 )*1000).toFixed(3) );
//			}
//		}
//		atable_data.push( atemp );
//		
//		atemp = [];
//		atemp[0] = "AsB.ELEV";
//		for( var i = 0; i < apart.length; i++){
//			if( amea.length == 0 || amea[i].length == 0  ){
//				atemp.push( "-" );
//
//			} else {
//				atemp.push( (amea[i] * 1.0).toFixed(3) );
//			}
//		}
//		atable_data.push( atemp );
//
//		atemp = [];
//		atemp[0] = "DIFF(MM)";
//		for( var i = 0; i < apart.length; i++){
//			if( amea.length == 0 || amea[i].length == 0  ){
//				atemp.push( "-" );
//
//			} else {
//				atemp.push( ( ( amea[i] * 1.0 - aelev[i] * 1.0 )*1000 - acam[i] ).toFixed(3) );
//			}
//		}
//		atable_data.push( atemp );
		
	//}
			
	
	var acolsize = [];
	for( var i = 0; i < apart.length+1; i++){
		if( i == 0 ){
			acolsize[i] = 100;				
		} else {
			acolsize[i] = 60;
		}
	}
	
	// camber table
	mod_table.table_create( sdiv_env, sdiv_target, '', acolsize, atable_header, atable_data );

}

function chart_girder( starget_div, adata_cam, sstage ){
	
	// 1. extract stage data
	
	//		(a) camber		
	//	column number of selected stage 
	
	var apart		= get_array_hlook( adata_cam, 0, "PART") ;	// 첫번째 컬럼의 키워드 데이터는 빼고 불러옴
	var aseg		= get_array_hlook( adata_cam, 0, "SEG") ;
	var aelem		= get_array_hlook( adata_cam, 0, "ELEM") ;
	var aelemij		= get_array_hlook( adata_cam, 0, "IJ") ;
	var astation	= get_array_hlook( adata_cam, 0, "STATION") ;
	var aelev		= get_array_hlook( adata_cam, 0, "ELEVC") ;
	var aft			= get_array_hlook( adata_cam, 0, "FT") ;
	var acamber		= get_array_hlook( adata_cam, 0, "camber") ;
	var acam		= get_array_hlook( adata_cam, 0, sstage) ;	// 단계별 처짐값
	
	//	chart title
	//	chart option tool
	//  PART 별로 데이터를 구분한다..
	var data = [];
	var trace, tracemea;
	var atempstat = [];
	var atempcamb = [];
	var atempseg  = [];
	var	atempmea = [];
	var	atempmeacam = [];
	var	atempsymbl = [];
	var	atempsymbc = [];
	var	atempsymbr = [];
	// var atempstat, atempcamb, atempseg, atempmea, atempmeacam, atempsymbl, atempsymbc, atempsymbr; PY1
	// var atempstat, atempcamb, atempseg, atempmea, atempmeacam, atempsymbl, atempsymbc, atempsymbr; PY2
	// var atempstat, atempcamb, atempseg, atempmea, atempmeacam, atempsymbl, atempsymbc, atempsymbr; 장력
	
	for( var i = 0; i < apart.length; i++){
		
			
		if( ( apart[i-1] != apart[i] ) || ( i == apart.length - 1 ) ){ // part가 달라지거나, 마지막 데이터 일때, 데이터 저장
			
			// theoretical camber data save
			trace = {
					  x: atempstat, //[1, 2, 3, 4],
					  y: atempcamb, //art_[12, 9, 15, 12],
					  name: apart[i-1],
					  text: atempseg,							  
					  mode: 'lines+markers',
					  line: {  dash: 'solid',   width: 1  },
					  type: 'scatter'
					};	

			data.push( trace);
			
//					// site measured data
//					if( astagemea ){
//						tracemea = {
//								  x: atempstat, //[1, 2, 3, 4],
//								  y: atempmeacam, //art_[12, 9, 15, 12],
//								  name: apart[i-1],
//								  text: atempseg,							  
//								  mode: 'lines+markers',
//								  line: {  dash: 'dot',   width: 1  },
//								  marker: {
//									//color: 'rgba(17, 157, 255,0.5)',
//									size: 8,
//									symbol : atempsymbc, //["x-thin","x-thin"], //"square-open","circle-open","x-thin"
//									line: {
//									  color: 'blue',
//									  width: 2
//									}
//								  },
//								  type: 'scatter'
//								};	
//								
//						data.push( tracemea );
//					}							
			
			// initialize
			atempstat = [];
			atempcamb = [];					
			atempseg = [];	
			
//			if( astage_mea ){
//				
//				atempmea = [];					
//				atempmeacam = [];
//				atempsymbl = [];
//				atempsymbc = [];
//				atempsymbr = [];
//			}
		}
			
		// save 시공단계별 캠버 data
		//if( aact[i].toUpperCase() == "A"  ){ // || aact[i].toUpperCase() == "N"
		
		if( acam[i] != "" ){
			atempstat.push( astation[i] );
			atempcamb.push( acam[i] * 1.0 );
			atempseg.push( aseg[i] * 1.0 );				
			atempsymbc = "x-thin";
		}
		
//			if( amea ){
//				//alert( "11212 " + amea[i].length + " aa" );
//				if( amea[i].length == 0  ){
//					//alert( amea[i] + " , " + aelev[i] );
//					atempmeacam.push( null );
//				} else {
//					//alert( 'here : ' + amea[i] + "  " + aelev[i] + " " + (amea[i]*1 - aelev[i]*1));
//					atempmeacam.push( ( amea[i]*1 - aelev[i]*1 )*1000 );
//				}
//			}

	}		

	Plotly.newPlot( starget_div, data, plotly_layout_gird, plotly_config);		
	
}

function chart_pylon( starget_div, adata_cam, spart, sstage ){

	var apart		= get_array_hlook( adata_cam, 0, "PART") ;	// 첫번째 컬럼의 키워드 데이터는 빼고 불러옴
	var aseg		= get_array_hlook( adata_cam, 0, "LOT") ;
	var aelev		= get_array_hlook( adata_cam, 0, "ELEV") ;
	var acam		= get_array_hlook( adata_cam, 0, sstage) ;	// 단계별 처짐값

	// initialize
	var atempelev = [];
	var atempcamb = [];					
	var atempseg = [];	
	var data = [];
	
	for( var i = 0; i < acam.length; i++){

		if( spart == apart[i] ){ // 동일한 pylon 데이터만 출력

			if( acam[i] != "" ){
				atempcamb.push( acam[i] * 1.0 );
				atempelev.push( aelev[i] * 1.0 );
				atempseg.push( aseg[i]  );				
				atempsymbc = "x-thin";
			}
		
		}
	}
//console.log( atempcamb );			
//console.log( atempelev );			
	// theoretical camber data save
	trace = {
			  x: atempcamb, //art_[12, 9, 15, 12],
			  y: atempelev, //[1, 2, 3, 4],
			  name: spart,
			  text: atempseg,							  
			  mode: 'lines+markers',
			  line: {  dash: 'solid',   width: 1  },
			  type: 'scatter'
			};	

	data.push( trace);
			
//					// site measured data
//					if( astagemea ){
//						tracemea = {
//								  x: atempstat, //[1, 2, 3, 4],
//								  y: atempmeacam, //art_[12, 9, 15, 12],
//								  name: apart[i-1],
//								  text: atempseg,							  
//								  mode: 'lines+markers',
//								  line: {  dash: 'dot',   width: 1  },
//								  marker: {
//									//color: 'rgba(17, 157, 255,0.5)',
//									size: 8,
//									symbol : atempsymbc, //["x-thin","x-thin"], //"square-open","circle-open","x-thin"
//									line: {
//									  color: 'blue',
//									  width: 2
//									}
//								  },
//								  type: 'scatter'
//								};	
//								
//						data.push( tracemea );
//					}				

	var plotly_layout_pylon = {
		
		title: spart,
		
		xaxis: {
			//range: [ 0.75, 5.25 ]
			showline: true,
			mirror: true,
			//tickformat :".3f",
			ticks: 'outside',
			title: "<i>Camber(MM)</i>"
		},

		yaxis: {
			//range: [0, 8]
			showline: true,
			mirror: true,
			//tickformat :".3f",
			ticks: 'outside',
			title: "<i>Elev(M)</i>"
		},

		showlegend: false,

		margin: {
			l: 100,
			r: 50,
			b: 50,
			t: 30
			//pad: 4
		}			
		
	};	
			
	Plotly.newPlot( starget_div, data, plotly_layout_pylon, plotly_config);		
	
}

function chart_cable( starget_div, adata_cam, sstage ){
	var acable		= get_array_hlook( adata_cam, 0, "NAME") ;
	var acab_t0		= get_array_hlook( adata_cam, 0, "T0") ;
	var acab_tr		= get_array_hlook( adata_cam, 0, "Tr") ;
	var acab_for	= get_array_hlook( adata_cam, 0, sstage) ;	// 단계별 처짐값

	// initialize
	var atempcable = [];
	var atemptr = [];					
	var atempfor = [];	
	var data = [];


	for( var i = 0; i < acable.length; i++){

		if( acab_for[i] == "" ){	// data없으면 장력 = 0
		
			atempfor.push( 0.0 );
			
		} else {
			
			atempfor.push( acab_for[ i ] * 1.0 );

		}
		
		atemptr.push( acab_tr[i] * 1.0 );
		atempcable.push( acable[i]  );				
		
	}


	var trace = {
			  x: atempcable, //art_[12, 9, 15, 12],
			  y: atemptr, //[1, 2, 3, 4],
			  //name: "Allow",
			  type: 'line',
			  
			  marker: {
				color: 'rgb(255,0,0)',
				opacity: 1.0,
			  }
			  
			};	

	data.push( trace);

	
	trace = {
			  x: atempcable, //art_[12, 9, 15, 12],
			  y: atempfor, //[1, 2, 3, 4],
			  width :[0.2],
			  //name: "Allow",
			  type: 'bar',
			  marker: {
				color: 'rgb(0,0,255)',
				opacity: 0.8,
				
			  }
			  
			};	

	data.push( trace);

	
	Plotly.newPlot( starget_div, data, plotly_layout_cable, plotly_config);		
}

function get_correction( ddiff ){
	
	if( Math.abs( ddiff ) <= 20 ){

		return 0;

	} else if( Math.abs( ddiff ) > 40 ){   // 40mm 초과시 20mm만 보정하고 나머지는 다음세그에서 보정
		
		if( ddiff >=0 ){

			return ddiff - 20;
			
		} else {
			
			return ddiff + 20;
		
		}

	} else {
		
		return ddiff * 0.5;					
		
	}
}


//function draw_camber_table( starget_div, aheader, acondata){
/*
function draw_camber_table( starget_div, apart, aseg, aelem, aelemij, astation, aelev, adef, ameas ){

	var style_1stcol;
	
	style_1stcol 	= " 'width : 80px; position:sticky; left:0; ' ";
	style_other 	= " 'width : 60px; ' ";

	var shtml;
	
	shtml  = "<thead>	";

	shtml += "	<tr >	";
	shtml += "<th style= " + style_1stcol + "  >PART</th>";
	
	for( var i = 0; i < apart.length; i++){

		shtml += "<th style= " + style_other + "  >";
		shtml += apart[i];
		shtml += "</th>";
		
	}
	
	shtml += "	</tr>	";
	
	shtml += "	<tr >	";
	shtml += "<th style= " + style_1stcol + "  >SEG</th>";
	
	for( var i = 0; i < apart.length; i++){

		shtml += "<th style= " + style_other + " >";
		shtml += aseg[i];
		shtml += "</th>";
		
	}
	
	shtml += "	</tr>	";

	shtml += "	<tr >	";
	shtml += "<th style= " + style_1stcol + "  >ELEM</th>";
	
	for( var i = 0; i < apart.length; i++){

		shtml += "<th style= " + style_other + " >";
		shtml += aelem[i];
		shtml += "</th>";
		
	}
	
	shtml += "	</tr>	";

	shtml += "	<tr >	";

	shtml += "<th style= " + style_1stcol + "  >IJ</th>";
	
	for( var i = 0; i < apart.length; i++){

		shtml += "<th style= " + style_other + " >";
		shtml += aelemij[i];
		shtml += "</th>";
		
	}
	
	shtml += "	</tr>	";

	shtml += "	<tr >	";
		shtml += "<th style= " + style_1stcol + "  >STATION</th>";
	
	for( var i = 0; i < apart.length; i++){

		shtml += "<th style= " + style_other + " >";
		shtml += (astation[i]*1).toFixed(3);
		shtml += "</th>";
		
	}
	
	shtml += "	</tr>	";

	shtml += "	<tr >	";
	shtml += "<th style= " + style_1stcol + "  >ELEV</th>";
	
	for( var i = 0; i < apart.length; i++){

		shtml += "<th style= " + style_other + " >";
		shtml += (aelev[i]*1).toFixed(3);
		shtml += "</th>";
		
	}
	
	shtml += "	</tr>	";

	shtml += "</thead>	";

	shtml  += "<tbody>	";


	shtml += "	<tr >	";

	shtml += "<td style= " + style_1stcol + "  >Camb (MM)</th>";
	
	for( var i = 0; i < adef.length; i++){

		shtml += "<td style= " + style_other + " >";
		shtml += (adef[i]*1).toFixed(0);
		shtml += "</td>";
		
	}

	shtml += "	</tr>	";

	shtml += "	<tr >	";

		shtml += "<td style= " + style_1stcol + "  >Elev (M)</th>";
	
	for( var i = 0; i < adef.length; i++){

		shtml += "<td style= " + style_other + "  >";
		shtml += (aelev[i]*1 + adef[i] /1000).toFixed(3);
		shtml += "</td>";
		
	}

	shtml += "	</tr>	";


	// measured data & difference, if exist
		
	shtml += "	<tr >	";

	shtml += "<td style= " + style_1stcol + "  >Meas (M)</th>";

		for( var i = 0; i < adef.length; i++){

			shtml += "<td style= " + style_other + "  >";
			
			if( ameas ){
			
				shtml += (ameas[i]*1).toFixed(3);
							
			}
			
			shtml += "</td>";
			
		}
	
	shtml += "	</tr>	";

	shtml += "	<tr >	";

		shtml += "<td style= " + style_1stcol + "  >Diff (MM)</th>";

		for( var i = 0; i < adef.length; i++){

			shtml += "<td style= " + style_other + "  >";
			
			if( ameas ){
			
				shtml += (ameas[i]*1 - adef[i]*1).toFixed(3);
							
			}
			
			shtml += "</td>";
			
		}
	
	shtml += "	</tr>	";
	
	shtml += "</tbody>	";


	var otable = document.getElementById( starget_div );
	otable.innerHTML = shtml;

}
*/

// array 2X2
function get_array_hlook( aarray, ikeyrow, skey ){	// 키워드가 포함된 ikeycol 에서 키워드 skey일때 column 데이터추출

	var bchk = false;
	
	for( var i = 0; i < aarray[0].length; i++){   // 행 갯수는 불변.. 0에서 줄수를 가져와도 무방
	
		if( aarray[ikeyrow][i].toUpperCase() == skey.toUpperCase() ){
 
			var ares = [];
			
			for( var j = ikeyrow + 1; j < aarray.length; j++){  // row 줄 수..
			
				ares.push( aarray[j][i] );
			
			}

			bchk = true;			
			return ares;	// ELEM I/J
			break;
			
		}
	}
	
	if( bchk == false ){
		return bchk;
		alert( "Failed to find : " + skey );
	}
					
}


//
//// array 2X2
//function get_array_hlook( aarray, ikeyrow, skey, irow ){ 	// 키워드가 포함된 ikeyrow 에서 키워드 skey일때 irow 데이터추출
//
//	var bchk = false;
//
//	for( var i = 0; i < aarray[0].length; i++){  
//	
//		if( aarray[ikeycol][i].toUpperCase() == skey.toUpperCase() ){
//			
//			bchk = true;
//			return aarray[irow][i];	// ELEM I/J
//			break;
//			
//		}
//	}
//	
//	if( bchk == false ){
//		alert( "Failed to find : " + skey );
//	}
//	
//}
//
//// array 2X2
//function get_array_hposi( aarray, ikeyrow, skey){ 	// 키워드가 포함된 ikeyrow 에서 키워드 skey일때 column 위치
//
//	var bchk = false;
//
//	for( var i = 0; i < aarray[ikeyrow].length; i++){
//		
//		if( skey.toUpperCase() == aarray[ikeyrow][i].toUpperCase() ){
//
//			bchk = true;
//			return i;
//			break;
//			
//		}
//		
//	}
//	
//	if( bchk == false ){
//		alert( "Failed to f