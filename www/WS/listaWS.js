var ID_USUARIO = window.localStorage.UsuarioId;
var TOKEN = window.localStorage.UsuarioToken;
// window.localStorage.produtoRecemAdicionado = "";

//___________________ CRIAR LISTA ________________________//
function criarLista(){
	var nomeLista = $("#nome_lista").val();
	var idUsuario = ID_USUARIO;
	var token = TOKEN;
	
    if (nomeLista != ''){ 	
		$.ajax({
            type: 'POST'
            , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/criarLista"
			, crossDomain:true
            , contentType: 'application/json; charset=utf-8'
            , dataType: 'json'
            , data: "{idUsuario:'"+idUsuario+"',token:'"+token+"',nomeLista:'"+nomeLista+"'}"
            , success: function (data, status){                    
				var lista = $.parseJSON(data.d); //salvando retorno do metodo do servidor                 
				if(typeof(lista.erro) === 'undefined'){
					alert("Lista criada com sucesso!");
					window.location = "lista.html?id="+lista.id_listaDeProdutos;
					return;						
				}else{					
					alert(lista.mensagem);
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

//___________________ RETORNAR NOME LISTA ________________________//
function retornarNomeLista(){
	//Pegar id pela URR e mostrar produtos da lista 
	var queries = {};
	$.each(document.location.search.substr(1).split('&'), function(c,q){
		var i = q.split('=');
		queries[i[0].toString()] = i[1].toString();
	});
	
	// $("#nomeDaLista").html(queries['id']);
	var idLista=queries['id'];
	window.localStorage.idListaClicada= idLista;

    $.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/retornarLista"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        ,data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idListaDeProdutos:'"+idLista+"'}"
        , success: function (data, status){                    
			var nomeLista = $.parseJSON(data.d);               
			$("#tituloLista").html(nomeLista.nome);
		}
        , error: function (xmlHttpRequest, status, err) {
            alert('Ocorreu um erro no servidor');
        }
    });
}

//_____________________________________ RETORNAR LISTA _____________________________________//
function retornarListas(){	
	window.localStorage.flag = 0;
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/listarListas" //chamando a função
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'						//tipos de dados de retorno
		, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"'}"
        , success: function (data, status){                    
			var listas = $.parseJSON(data.d);
			if(typeof(listas.erro) === 'undefined'){
				for(var i=0; i<listas.length ;i++)
					htmlListarListas(listas[i]);
			}else{
				alert(itens.menssagem);
				window.location = "listas.html";
				return;
			}
        }
        , error: function (xmlHttpRequest, status, err) {
            alert("Ocorreu um erro no servidor");
        }
    });
}

//Função para guardar o id da lista clicada no local Storage 
//se ela tiver sido clicada para um checkin
function guardarIdListaCheckin(idLista){
	window.localStorage.listaClicadaCheckin = idLista;
}

function zerarChekinEstabelecimento(){
	localStorage.removeItem("estab");
}

function htmlListarListas(listas){
	var conteudo = document.createElement("div");		
	conteudo.innerHTML =		
		"<ul class='menu-principal listas-menu'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'>"
	+			"<a href='lista.html?id="+listas.id_listaDeProdutos+"' >"+listas.nome+"</a>"
	+			"</a>"
	+		"<img src='img/edit.png' width='25' data-toggle='modal' data-target='#editarLista' onclick='listaClicadaEditar("+listas.id_listaDeProdutos+")' class='edit-estabe' style='margin-right: 40px;'/>"
	+		"<img src='img/remove.png' width='25' onclick='excluirLista("+listas.id_listaDeProdutos+")' class='edit-estabe' style='margin-right: -65px;'/>"
	+		"</li>"
	+	"</ul>";
	
	var pai = document.getElementById("conteudo");
	pai.appendChild(conteudo);
}


//_____________________________________ ADICIONAR PRODUTOS À LISTA _____________________________________//
function criarProduto(flag){
	if(flag=="checkin")
	var nomeDoProduto = $("#nomeProdutoCheck").val();
	else
	var nomeDoProduto = $("#nomeProduto").val();
	
	var codigoDeBarras = $("#cod_barra").val();
	var marca = $("#marcaDoProduto").val();
	var embalagem = $('select[name=embalagemCadastrar]').val(); 
	var unidade = parseInt($('select[name=unidadeDoProduto]').val());
	var quantidade = parseInt($("#quantidadeDoProduto").val());
	var idLista = parseInt(window.localStorage.idListaClicada);
	
	if(nomeDoProduto=="" || marca==""){alert("Preencha todos os campos!");return;}
	
	var url="http://192.168.1.99/Servidor/ListaDeProdutos.asmx/criarProduto";
	var data="{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',marca:'"+marca+"',nome:'"+nomeDoProduto+"',unidade:'"+unidade+"',embalagem:'"+embalagem+"',quantidade:'"+quantidade+"'}";
	
	if(codigoDeBarras.trim() !=''){
		url="http://192.168.1.99/Servidor/ListaDeProdutos.asmx/criarProdutoComCodigo";
		data="{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',marca:'"+marca+"',nome:'"+nomeDoProduto+"',unidade:'"+unidade+"',embalagem:'"+embalagem+"',codigo:'"+codigoDeBarras+"'tipoCod:'"+tipoCod+"',quantidade:'"+quantidade+"'}";
	}	
	
	if (nomeDoProduto.trim() != ''){
		$.ajax({
            type: 'POST'
            , url: url
			, crossDomain:true
            , contentType: 'application/json; charset=utf-8'
            , dataType: 'json'
            , data: data
            , success: function (data, status){
				var retorno=$.parseJSON(data.d);
				if(retorno=="OK"){
					alert("Produto cadastrado com sucesso!");
					
					if(flag == "checkin"){
						window.localStorage.produtoRecemAdicionado += ","+window.localStorage.listaClicadaCheckin+"-"+(nomeDoProduto).toLowerCase();
						window.location = "checkin.html";
						return;	
					}else{
						window.location = "lista.html?id="+idLista;
						return;						
					}
				}else{
					alert(retorno.mensagem);
					return;
				}	
            }
            , error: function (xmlHttpRequest, status, err) {
                alert('Ocorreu um erro no servidor');
            }
        });
	}   
}

//_____________________________________ RETORNAR PRODUTOS DA LISTA (VISUALIZAR LISTA) _____________________________________//
function retornarProdutosDaListas(){	
	//Pegar id pela URR e mostrar produtos da lista 
	var queries = {};
	$.each(document.location.search.substr(1).split('&'), function(c,q){
		var i = q.split('=');
		queries[i[0].toString()] = i[1].toString();
	});
	
	// $("#nomeDaLista").html(queries['id']);
	var idLista=queries['id'];
	window.localStorage.idListaClicada= idLista;
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/retornarLista"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idListaDeProdutos:'"+idLista+"'}"
        , success: function (data, status){                    
			var produtos = $.parseJSON(data.d);					   //indice para pegar o nome
			if(typeof(produtos.erro) === 'undefined'){
				for(var i=0; i<produtos.itens.length ;i++)
					htmlListarProdutos(produtos.itens[i]);
			
			}else{
				alert(produtos.messagem);
				return;
			}
        }
        , error: function (xmlHttpRequest, status, err) {
            alert("Ocorreu um erro no servidor");
        }
    });
}

function htmlListarProdutos(produtos){
	
	var conteudo = document.createElement("div");
	
	
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a>"+produtos.nome+"</a>"	
	+		"<img src='img/remove.png' width='25' onclick='excluirProdutoDaLista("+produtos.id_produto+")' class='edit-estabe'/>"
	+		"<a class='edit-estabe' style='color:#3379bd'>Quant. "+produtos.quantidade+"</a>"
	+	"</li>"
	+ "</ul>";
	
	var pai = document.getElementById('conteudo');
	pai.appendChild(conteudo);
}

//_____________________________ EDITAR NOME LISTA____________________________//
function editarNomeLista(){
	var idLista = parseInt(window.localStorage.idEditarLista);
	var idUsuario = ID_USUARIO;
	var novoNomeDaLista = $("#novo_nome_lista").val();
	var token = TOKEN;
    $.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/editarNomeLista"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+idUsuario+"',token:'"+token+"',idLista:'"+idLista+"',novoNomeDaLista:'"+novoNomeDaLista+"'}"
        , success: function (data, status){                    
			var itens = $.parseJSON(data.d);               
			if(itens == "Ok"){
				alert("Nome da lista alterado com sucesso!");
				window.location = "listas.html";
				return;										
			}else{
				alert("Erro ao alterar o nome da lista.");
				return;	
			}
		}
        , error: function (xmlHttpRequest, status, err) {
            $('.resultado').html('Ocorreu um erro');
        }
    });
}

//______________________________________ EXCLUIR LISTA _____________________________________________//
function excluirLista(id){
	var confirme =  confirm ("Tem certeza que deseja excluir essa lista?")
	if(confirme){
		var idLista = id;
		var idUsuario = ID_USUARIO;
		var token = TOKEN;
	   
	   $.ajax({
			type: 'POST'
			, url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/removerLista"
			, crossDomain:true
			, contentType: 'application/json; charset=utf-8'
			, dataType: 'json'
			, data: "{idUsuario:'"+idUsuario+"',token:'"+token+"',idLista:'"+idLista+"'}"
			, success: function (data, status){                    
				var itens = $.parseJSON(data.d);                
				if(itens == "OK"){
					var listas = window.localStorage.produtoRecemAdicionado.substring(1,window.localStorage.produtoRecemAdicionado.length);					
					alert("Lista excluida com sucesso!");
					window.location = "listas.html";
					return;			
				}else{
					alert("Erro ao excluir a lista.");
					return;	
				}				
			}
			, error: function (xmlHttpRequest, status, err) {
				$('.resultado').html('Ocorreu um erro');
			}
		});
	}
}

//_______________Excluir Produto da lista_______________________//
function excluirProdutoDaLista(id){
	var idLista = parseInt(window.localStorage.idListaClicada);
	var idUsuario = ID_USUARIO;
	var token = TOKEN;
	var idProduto = parseInt(id);
   
   $.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/removerProdutoDaLista"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+idUsuario+"',token:'"+token+"',idProduto:'"+idProduto+"',idLista:'"+idLista+"'}"
        , success: function (data, status){                    
			var retorno = $.parseJSON(data.d);                
			if(retorno == "OK"){
				alert("Produto excluido da lista!");
				window.location = "lista.html?id="+idLista;
				return;						
			}else{
				alert(retorno.mensagem);
				window.location = "lista.html?id="+idLista;
				return;
			}				
        }
        , error: function (xmlHttpRequest, status, err) {
            alert('Ocorreu um erro no servidor');
        }
    });
}

function listaClicadaEditar(id) {
	window.localStorage.idEditarLista = id;
}

//_______________________ RETORNAR ESTABELECIMENTOS MAIS BARATO ______________________//

function retornarEstabelecimentosMaisBaratos(){	

	var idLista = parseInt(window.localStorage.idListaClicada);
	
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/buscarOfertas"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"'}"
		, success: function (data, status){                    
			var estabelecimentos = $.parseJSON(data.d);
			
			//------------ ordenar -----------------//
			var i, j, preco,oferta,guardar;
			for (i = 1; i < estabelecimentos.length; i++) {
			   preco = estabelecimentos[i].precoDaLista;
			   guardar = estabelecimentos[i];
			   oferta = estabelecimentos[i].itensEncontrados;
			   j = i;
			   while((j>0) && 
			   (oferta>estabelecimentos[j-1].itensEncontrados  || (preco<estabelecimentos[j-1].precoDaLista && oferta==estabelecimentos[j-1].itensEncontrados)))
			   {
					estabelecimentos[j] = estabelecimentos[j-1];
					j = j-1;
			   }
			   estabelecimentos[j] = guardar;
			}
			//------------------------------------------//

			document.getElementById("referenciaEstab").innerHTML = "";
			for(var i=0 ;i<estabelecimentos.length ;i++){
				listaEstiloEstab(estabelecimentos[i]); 
			}			
        }
        , error: function (xmlHttpRequest, status, err) {
            alert('Ocorreu um erro no servidor');
        }
    });	
}

function listaEstiloEstab(estabelecimentos)
{
	var conteudo = document.createElement("div");
		
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu' style='top:-30px;'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a>"+estabelecimentos.nomeEstabelecimento+"</a>"	
	+		"<a class='edit-estabe' style='color:#3379bd'>R$ "+(estabelecimentos.precoDaLista).toFixed(2)+"</a>"
	+		"<a class='edit-estabe' style='color: rgb(255, 94, 0);font-weight: bold;'>"+estabelecimentos.itensEncontrados+'/'+estabelecimentos.itensTotal+"</a>"
	+	"</li>"
	+ "</ul>";
	
	var pai = document.getElementById('referenciaEstab');
	pai.appendChild(conteudo);
}


function procurarProduto(){	
	var nome = $("#nome_produto").val().trim();
	$('#produtosEncontrados').modal('show');
	localStorage.removeItem("pesquisarPrincipal");
	pesquisarProdutos(nome);
}
