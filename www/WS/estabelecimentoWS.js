var ID_USUARIO = window.localStorage.UsuarioId;
var TOKEN = window.localStorage.UsuarioToken;

//______________________ CADASTRAR ESTABELECIMENTO _________________________//
function cadastrarEstabelecimento(){
	confirme = confirm("O cadastro so podera ser realizado se voce estiver em um estabelecimento!\n Voce esta em um estabelecimento?");
	if(confirme){
		var nomeEstabelecimento = $("#nomeEstab").val();
		var bairroEstabelecimento = $("#bairroEstabelecimento").val();
		var cidadeEstabelecimento = $("#cidadeEstabelecimento").val();
		var unidadeEstabelecimento = $("#unidadeEstabelecimento").val();
		var idUsuario = ID_USUARIO;
		var token = TOKEN;	
		var latitude = window.localStorage.lat;
		var longitude = window.localStorage.lon;
		
		if(latitude == undefined && longitude == undefined){
			alert("Erro no geocalizador!");
			return;
		}
		
		var nonNumbers = /\D/;
		if(nonNumbers.test(unidadeEstabelecimento)){
			alert("Unidade so recebe digitos!");
		}else{
			if (nomeEstabelecimento != '' || bairroEstabelecimento!= '' || cidadeEstabelecimento!= '' || unidadeEstabelecimento!= ''){ 	
				$.ajax({
					type: 'POST'
					, url: "http://192.168.1.99/Servidor/Estabelecimento.asmx/cadastrarEstabelecimento"
					, crossDomain:true
					, contentType: 'application/json; charset=utf-8'
					, dataType: 'json'
					, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nome:'"+nomeEstabelecimento+"',bairro:'"+bairroEstabelecimento+"',cidade:'"+cidadeEstabelecimento+"',numero:'"+parseInt(unidadeEstabelecimento)+"',latitude:'"+latitude+"',longitude:'"+longitude+"'}"
					, success: function (data, status){                    
						var estabelecimento	= $.parseJSON(data.d);
						if(typeof(estabelecimento.erro) === 'undefined'){
							alert("Estabelecimento criado com sucesso!");
							window.location = "estabelecimentos.html";
							return;						
						}else{					
							alert(retorno.mensagem);
							return;
						}
					}
					, error: function (xmlHttpRequest, status, err) {
						alert("Ocorreu um erro no servidor");
					}
				});
			}else{
				alert("Campo vazio.");
				return false;
			}
		}
	}
}

//______________________ LISTAR ESTABELECIMENTO _________________________//
function listarEstabelecimento(){	

	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/Estabelecimento.asmx/listarEstabelecimento"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
		, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nome:'',bairro:'',cidade:''}"
        , success: function (data, status){                    
			var estabelecimentos = $.parseJSON(data.d);		
			for(var i=0; i<estabelecimentos.length ;i++)
			htmlListarEstabelecimentos(estabelecimentos[i]);
        }
        , error: function (xmlHttpRequest, status, err) {
            alert("Ocorreu um erro no servidor");
        }
    });
}


//______________________ EDITAR ESTABELECIMENTO _________________________//
function editarEstabelecimento(flagEstab){	
	
	if(flagEstab == "aberto"){
		var queries = {};
		$.each(document.location.search.substr(1).split('&'), function(c,q){
			var i = q.split('=');
			queries[i[0].toString()] = i[1].toString();
		});

		var idEstab=queries['id'];
		window.localStorage.idEstabelecimento= idEstab;
	}
	
	var nomeEstabelecimento = $("#novoNomeEstabelecimento").val();
	var bairroEstabelecimento = $("#novoBairroEstabelecimento").val();
	var cidadeEstabelecimento = $("#novoCidadeEstabelecimento").val();
	var unidadeEstabelecimento = $("#novoUnidadeEstabelecimento").val();
	var idEstabelecimento = parseInt(window.localStorage.idEstabelecimento);
	var idUsuario = ID_USUARIO;
	var token = TOKEN;
	
	var nonNumbers = /\D/;
	if(nonNumbers.test(unidadeEstabelecimento)){
		alert("Unidade so recebe digitos!");
	}else{
		if (nomeEstabelecimento != '' || bairroEstabelecimento!= '' || cidadeEstabelecimento!= '' || unidadeEstabelecimento!= ''){ 	
			$.ajax({
				type: 'POST'
				, url: "http://192.168.1.99/Servidor/Estabelecimento.asmx/editarEstabelecimento"
				, crossDomain:true
				, contentType: 'application/json; charset=utf-8'
				, dataType: 'json'
				, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',id:'"+idEstabelecimento+"',nome:'"+nomeEstabelecimento+"',bairro:'"+bairroEstabelecimento+"',cidade:'"+cidadeEstabelecimento+"',numero:'"+unidadeEstabelecimento+"'}"
				, success: function (data, status){                    
					var retorno = $.parseJSON(data.d);               
					if(typeof(retorno.erro) === 'undefined'){
						alert("Dados do estabelecimento alterados com sucesso!");
						window.location = "estabelecimentos.html";
						return;							
					}else{
						alert(retorno.mensagen);
						return;
					}
				}
				, error: function (xmlHttpRequest, status, err) {
					alert("Ocorreu um erro no servidor");
				}
			});
		}else{
			alert("Campo vazio.");
			return false;
		}
	}
}

function estabelecimentoClicadoId(id){
	window.localStorage.idEstabelecimento = id;
	return;
}

//______________________ AUTOCOMPLETE ESTABELECIMENTO _________________________//
function autoCompleteEstabelecimento(){	
	var nomeEstabelecimento = $("#nomeEstab").val();
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/Estabelecimento.asmx/autoCompleteEstabelecimento"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nome:'"+nomeEstabelecimento+"'}"
		, success: function (data, status){                    
			var estabelecimentos = $.parseJSON(data.d);
			$("#nomeEstab").autocomplete({ source: estabelecimentos }); 
        }
        , error: function (xmlHttpRequest, status, err) {
            alert("Ocorreu um erro no servidor");
        }
    });	
}

//______________________ VISUALIZAR ESTABELECIMENTO _________________________//
function visualizarEstabelecimento(){	

	var queries = {};
	$.each(document.location.search.substr(1).split('&'), function(c,q){
		var i = q.split('=');
		queries[i[0].toString()] = i[1].toString();
	});

	var idEstabelecimento=queries['id'];
	window.localStorage.idEstabelecimentoClicado= idEstabelecimento;
	
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/retornarItensPorEstabelecimento"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idEstabelecimento:'"+parseInt(idEstabelecimento)+"'}"
        , success: function (data, status){                    
			var estabelecimentos = $.parseJSON(data.d);	
			
			if(estabelecimentos.length == 0){
				alert("Nenhum produto cadastrado nesse estabelecimento!");
				return;
			}
	
			var novoArray = [];
			var aux=0;
			var produtoAnterior = estabelecimentos[0];
			for(var u=0; u<estabelecimentos.length; u++){
				if(estabelecimentos[u].nomeProduto == produtoAnterior.nomeProduto){
					if(produtoAnterior.qualificacao<estabelecimentos[u].qualificacao){
						produtoAnterior = estabelecimentos[u];
					}
				}else{
					novoArray[aux++]=produtoAnterior;
					produtoAnterior = estabelecimentos[u];
				}
			}			
			
			estabelecimentos = novoArray;
			
			for(var i=0; i<estabelecimentos.length; i++)
			htmlListarProdutosEstabelecimentos(estabelecimentos[i]);
		}
        , error: function (xmlHttpRequest, status, err) {
            alert("Ocorreu um erro no servidor");
        }
    });
}

function htmlListarProdutosEstabelecimentos(estabelecimentos){
	
	var conteudo = document.createElement("div");
	
	conteudo.innerHTML =	
	"<ul class='menu-principal listas-menu'>"
	+	"<li class='list-group-item' style='margin-bottom: -20px;'>"
	+		"<a href='produto.html' id='"+estabelecimentos.idItem+"'>"+estabelecimentos.nomeProduto+"</a>"
	+		"<span class='sub-titulo-menu'>R$ "+(estabelecimentos.preco).toFixed(2)+"</span>"
	+	"</li>"
	+"</ul>"
	var pai = document.getElementById("conteudo");
	pai.appendChild(conteudo);
}

function googleMaps(latitude,longitude){
	if(latitude == 0 && longitude == 0){
		alert("Estabelecimento nao possui localizacao cadastrada!");
	}else{
		window.localStorage.latitude = latitude;
		window.localStorage.longitude = longitude;
		initialize();
	}
}

function googleMapsAberto(latitude,longitude){
	window.localStorage.latitude = latitude;
	window.localStorage.longitude = longitude;
}


function abrirMapa(){
	$("#localizacao").modal("show");
	initialize();
}

function initialize() {
	var latitude = window.localStorage.latitude;
	var longitude = window.localStorage.longitude;
	document.getElementById("googleMap").innerHTML = "Voce nao possui conexao para conectar ao mapa";
	
	var position = new google.maps.LatLng(latitude,longitude);

	var mapProp = {
		center: position,
		zoom:18,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
  
	var marker = new google.maps.Marker({
		position: position,
		map:map,
		title:"hi posiction",
		animation: google.maps.Animation.BOUNCE
	});	
}

/*==============================================
    GENERAL HTML AND STYLES    
    =============================================*/
/*listar estabelecimentos*/	
function htmlListarEstabelecimentos(estabelecimentos){
	
	var conteudo = document.createElement("div");
	
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a href='estabelecimento.html?id="+estabelecimentos.id_estabelecimento+"' onclick='googleMapsAberto("+estabelecimentos.latitude+","+estabelecimentos.longitude+")'>"+estabelecimentos.nome+" </a>"	
	+		"<div class='btn-acao'>"
	+			"<img src='img/icon-google-maps.png' width='30' data-toggle='modal' onclick='googleMaps("+estabelecimentos.latitude+","+estabelecimentos.longitude+")' data-target='#localizacao'  class='img-checkin' />"
	+		"</div>"	
	+		"<img src='img/edit.png' width='30' data-toggle='modal' data-target='#editarEstabelecimento' onclick='estabelecimentoClicadoId("+estabelecimentos.id_estabelecimento+")' class='edit-estabe'/>"
	+	"</li>"
	+ "</ul>"
	
	var pai = document.getElementById("conteudo");
	pai.appendChild(conteudo);
}
