// JavaScript Document

/* 
* sistema de logs 
*/
var i_log = 0;
function mkLog(text){
	var date = new Date();
	var txt = i_log + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + text;
	i_log++;
	console.log(txt);
	//$("#log").append(txt  + "<br>");
}

/* 
* variables de la aplicación
*/
	var existe_db
	var db
	
/* 
* carga inicial de la app
*/
function onBodyLoad() {    
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady(){
	mkLog("Aplicación cargada y lista");
    //navigator.notification.alert("PhoneGap is working");
	
	existe_db = window.localStorage.getItem("existe_db");
	db = window.openDatabase("MonicaProject", "1.0", "La tarea final", 2*1024*1024);
	if(existe_db == null){
		creaDB();
	}else{
		cargaDatos();
	}
	
	
	$("#btnAceptar").click(function(e){
		if($.id != -1){
		 	saveEditForm();
		 }else{
			saveNewForm();
		 }
	 });
}


/* 
* creación de ña base de datos
*/
function creaDB(){
	db.transaction(creaNuevaDB, errorDB, creaSuccess);
	
}

function creaNuevaDB(tx){
	mkLog("Creando base de datos");
	
	tx.executeSql('DROP TABLE IF EXISTS items');
	
	var sql = "CREATE TABLE IF NOT EXISTS items ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"name VARCHAR(50), " +
		"description VARCHAR(255), " +
		"price INTEGER, " +
		"stock INTEGER, " +
		"category VARCHAR(50), " +
		"image VARCHAR(100), " +
		"date VARCHAR(30) )";
		
	tx.executeSql(sql);
	
	tx.executeSql("INSERT INTO items (name, description, price, stock, category, date) VALUES ('GTX 960','Está childa', '3500','15','Tarjetas de vídeo','25/25/2016')");
}


function creaSuccess(){
	window.localStorage.setItem("existe_db", 1);
	cargaDatos();
}

function errorDB(err){
	mkLog("Error procesando SQL " + err.code);
	navigator.notification.alert("Error procesando SQL " + err.code);
}



/* 
* carga de datos desde la base de datos
*/
function cargaDatos(){
	db.transaction(cargaRegistros, errorDB);
}

function cargaRegistros(tx){
	mkLog("Cargando registros de la base de datos");
	tx.executeSql('SELECT * FROM items', [], cargaDatosSuccess, errorDB);
}

function cargaDatosSuccess(tx, results){
	mkLog("Recibidos de la DB " + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros");
		navigator.notification.alert("No hay items en la base de datos");
	}
	
	for(var i=0; i<results.rows.length; i++){
		var producto = results.rows.item(i);
		var selector = $("#" + producto.category + " ul");
		var foto = producto.image;
		if(foto == ""){
			foto = "assets/no_foto.png";
		}
		selector.append('<li id="li_'+producto.id+'"><a href="#detalle" data-uid='+producto.id+' class="linkDetalles"><div class="interior_lista"><img src="'+ foto +'" class="img_peq"/><span>' + producto.name+ '</span></div></a><a href="#form"  data-theme="a" data-uid='+producto.id+'  class="linkForm">Predet.</a></li>').listview('refresh');
	}
	
	$(".linkDetalles").click(function(e){
		$.id = $(this).data("uid");
	});
	
	$(".linkForm").click(function(e){
		$.id = $(this).data("uid");
	});
}


/*
* vista detalle
*/

$(document).on("pagebeforeshow", "#detalle", function(){
	if(db != null){
		db.transaction(queryDBFindByID, errorDB);
	}
});


function queryDBFindByID(tx) {
    tx.executeSql('SELECT * FROM items WHERE id='+$.id, [], queryDetalleSuccess, errorDB);
}

function queryDetalleSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista detalle" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista detalle");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	$("#infoItem").html($.registro.categoria);
		var _foto = $.registro.image;
		if(_foto == ""){
			_foto = "assets/no_foto.png";
		}
		$("#campoImagen").attr("src", _foto);
		$("#campoNombre").html($.registro.name );
		$("#campoDescripcion").html($.registro.description);
		
}

/*
* vista detalle
*/
//vista de la página de edición
$(document).on('pagebeforeshow', '#form', function(){ 
	mkLog('ID recuperado en vista form: ' + $.id);
	
	initForm();
	if(db != null && $.id != -1){
		db.transaction(queryDBFindByIDForm, errorDB);
	}
});

function queryDBFindByIDForm(tx) {
    tx.executeSql('SELECT * FROM items WHERE id='+$.id, [], queryFormSuccess, errorDB);
}

function queryFormSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista Form" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista form");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	
		$.imageURL = $.registro.image;
		if($.imageURL == ""){
			$.imageURL = "assets/no_foto.png";
		}
		$("#campoImagen").attr("src", $.imageURL);
		$("#campoNombre").val($.registro.nombre);
		$("#campoDescripcion").val($.registro.apellidos);
		
		
			
		
}
$(document).on('pagebeforeshow', '#home', function(){ 
	$.id = -1;
});
function initForm(){
	$.imageURL = "assets/no_foto.png";
	
	$("#campoImagen").attr("src", $.imageURL);
	$("#campoNombre").val("");
	$("#campoDescripcion").val("");
	
		
	
}


/*
* modificando registros
*/
/*
function saveEditForm(){
	if(db != null){
		db.transaction(queryDBUpdateForm, errorDB, updateFormSuccess);
	}
}

function queryDBUpdateForm(tx){
	var cat = $("#cajaCategorias").find("input:checked").val();
	tx.executeSql('UPDATE clientes SET nombre="'+$("#ti_nombre").val()+'", apellidos="'+$("#ti_apellidos").val()+'",telefono="'+$("#ti_telefono").val()+'",email="'+$("#ti_mail").val()+'",categoria="'+cat+'",foto = "'+$.imageURL+'" WHERE id='+$.id);
}
function updateFormSuccess(tx) {
	var selector = $("#li_"+$.id);
	
	var selector = $("#li_"+$.id).clone(true);
	selector.find("img").attr("src", $.imageURL);
	selector.find("a:first").find("span").html($("#ti_nombre").val() + " " + $("#ti_apellidos").val());
	
	
	$("#li_"+$.id).remove();
	
	var cat = $("#cajaCategorias").find("input:checked").val();
	var lista = $("#lista_" + cat + " ul")
	lista.append(selector).listview('refresh');
	
	
	$.mobile.changePage("#home");
}

*/

/*
* creando registros
*/
function saveNewForm(){
	if(db != null){
		db.transaction(queryDBInsertForm, errorDB);
	}
}

function queryDBInsertForm(tx){
	var cat = $("#campoCategoria").selectmenu({ width : 'auto'});
	
	tx.executeSql("INSERT INTO items (name, description,  price, stock, category, date) VALUES ('"+$("#campoNombre").val()+"','"+$("#campoDescripcion").val()+"','"+$("#campoPrecio").val()+"', '"+$("#campoPrecio").val()+"', '"+cat+"','"+$("#campoFecha").val()+"')", [], newFormSuccess, errorDB);
}
function newFormSuccess(tx, results) {
	var cat = $("#campoCategoria").selectmenu({ width : 'auto'});
	var lista = $("#" + cat + " ul")
	
	
	var obj = $('<li id="li_'+results.insertId+'"><a href="#infoItem" data-uid='+results.insertId+' class="linkDetalles"><div class="interior_lista"><span>' + $("#campoNombre").val() + '</span></div></a><a href="#agregarItem"  data-theme="a" data-uid='+results.insertId+'  class="linkForm">Predet.</a></li>');
	obj.find('.linkDetalles').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	
	obj.find('.linkForm').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	lista.append(obj).listview('refresh');
	
	
	$.mobile.changePage("#home");
}