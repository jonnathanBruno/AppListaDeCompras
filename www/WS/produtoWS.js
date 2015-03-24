var ID_USUARIO = window.localStorage.UsuarioId;
var TOKEN = window.localStorage.UsuarioToken;

//______________________________ AUTO COMPLETE MARCA _______________________________________// 
function autoCompleteMarca(flagMarca){

	if(flagMarca == "cadastrar"){
		var nomeMarca = $("#marcaDoProduto").val();
		var id = "#marcaDoProduto";
	}
	if(flagMarca == "editar"){
		var nomeMarca = $("#marcaDoProdutoEditado").val();
		var id = "#marcaDoProdutoEditado";
	}	
	if(flagMarca == "pesquisar"){
		var nomeMarca = $("#marcaProduto").val();
		var id = "#marcaProduto";
	}	
	
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/Produto.asmx/autocompleteMarca"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nomeMarca:'"+nomeMarca+"'}"
		, success: function (data, status){                    
			var marcas = $.parseJSON(data.d); //salvando o nome das marcas em um array
			$(id).autocomplete({ source: marcas }); 
        }
        , error: function (xmlHttpRequest, status, err) {
            alert('Ocorreu um erro no servidor');
        }
    });	
}
//______________________________ AUTO COMPLETE PRODUTO _______________________________________// 
function autoComplete(){
	
	var nomeProduto = $("#nomeDoProduto").val();
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/Produto.asmx/autocomplete"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nomeProduto:'"+nomeProduto+"'}"
		, success: function (data, status){                    
			var produtos = $.parseJSON(data.d); //salvando o nome dos produtos em um array
			$("#nomeDoProduto").autocomplete({ source: produtos }); 
        }
        , error: function (xmlHttpRequest, status, err) {
           alert('Ocorreu um erro no servidor');
        }
    });	
}

//______________________________ AUTO COMPLETE PRODUTO NA LISTA _______________________________________// 
function autoCompleteLista(flag){
	
	if(flag == "lista"){
		var nomeProduto = $("#nome_produto").val();
		var id = "#nome_produto";
	}else{
		var nomeProduto = $("#nomeProduto").val();
		var id = "#nomeProduto";
	}

	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/Produto.asmx/autocomplete"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nomeProduto:'"+nomeProduto+"'}"
		, success: function (data, status){                    
			var produtos = $.parseJSON(data.d); //salvando o nome dos produtos em um array
			$(id).autocomplete({ source: produtos }); 
        }
        , error: function (xmlHttpRequest, status, err) {
           alert('Ocorreu um erro no servidor');
        }
    });	
}

//_______________________ PESQUISAR PRODUTO POR NOME ___________________________//
window.pesquisarProdutos = function(flagProduto)
{
	var nome;
	var marca = '';
	var embalagem = 0; 
	var dados;
	var url;
	var passou=false;
	
	if(flagProduto=="checkin"){
		nome = $("#nomeProduto").val().trim();
	}
	else if(flagProduto!="principal"){//pesquisa feita na lista
		nome=flagProduto;
	}
	else{//pesquisa feita na tela principal
		nome = $("#nomeDoProduto").val().trim();
		marca = $("#marcaProduto").val().trim();
		embalagem = $('select[name=embalagem]').val();
	}
	

	//------ Pesquisar por embalagem ----//
	if(nome != "" && embalagem != 0){
		dados =  "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',marca:'"+marca+"',nome:'"+nome+"',embalagem:'"+embalagem+"'}"
		url = "http://192.168.1.99/Servidor/Produto.asmx/pesquisarProdutosEmbalagem"
		passou=true;
	}	
	//------ Pesquisar por nome -----//
	else if(nome != ""){
		dados = "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',marca:'"+marca+"',nome:'"+nome+"'}"
		url   = "http://192.168.1.99/Servidor/Produto.asmx/pesquisarProdutosNome";
		passou=true;
	}	
	//------ Pesquisar por marca -----//
	else if(marca != ""){
		dados = "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',marca:'"+marca+"'}"
		url = "http://192.168.1.99/Servidor/Produto.asmx/pesquisarProdutosMarca"	
		passou=true;
	//------ Nenhum campo preenchido -------//	
	}else{
		alert("Preencha pelo menos Nome ou Marca");
		return;
	}
	
	$.ajax({
        type: 'POST'
        , url: url
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: dados
		, success: function (data, status){  
			var produto = $.parseJSON(data.d);		
			
			//----------- nenhum produto encontrado ------------//
			if(produto.erro == "Erro de Pesquisa"){
			
				if(flagProduto!="principal"){//pesquisa feita na lista
					var stringConteudo = "<div>"
					+	"<div class='alert-lista-nao-criada'>Nada foi encontrado!! Cadastre um novo Produto!</div>"
					+		"<div class='btn btn-primary' data-target='#cadastrarProduto' data-dismiss='modal' data-toggle='modal'>"
					+		"Cadastrar um novo Produto!!"
					+		"</div>"
					+"</div>";
				}else{
					var stringConteudo = "<div class='alert-lista-nao-criada'>Nada foi encontrado na sua pesquisa!</div>"
				}
				
				document.getElementById("referencia").innerHTML = "";
				var conteudo  = document.createElement("div");
				conteudo.innerHTML = stringConteudo;
				
				var pai = document.getElementById("referencia");
				pai.appendChild(conteudo);	
				$('#produtosEncontradosCheckin').modal('show');
			
			//---------- produtos encontrado -------------------//			
			}else{	
			
				if(flagProduto=="checkin"){
					$('#produtosEncontradosCheckin').modal('show');
					document.getElementById("referencia").innerHTML = "";
					for(var i=0 ;i<produto.length ;i++)
					htmlListarProdutosCheckin(produto[i]);
				}
				else if(flagProduto!="principal"){
					document.getElementById("referencia").innerHTML = "";
					for(var i=0 ;i<produto.length ;i++)
					htmlListarProdutosLista(produto[i]);
					
				}else{
					document.getElementById("pesquisa").innerHTML = "";
					document.getElementById("referencia").innerHTML = "";
					for(var i=0 ;i<produto.length ;i++)
					htmlListarProdutosPrincipal(produto[i]);
				}
			}
        }
        , error: function (xmlHttpRequest, status, err) {
            alert('Ocorreu um erro no servidor');
        }
    });	
}

function htmlListarProdutosLista(produtos){
	
	var conteudo = document.createElement("div");
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu' style='top: -30px;'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a data-target='#quantidade' data-dismiss='modal' data-toggle='modal' onclick='itemVisializar("+produtos.id_produto+")'  >"+produtos.nome+"</a>"	
	+		"<img src='img/edit.png' width='25' data-target='#editarProduto' data-toggle='modal' onclick='pegarIdProdutoEditar("+produtos.id_produto+")' class='edit-estabe'/>"
	+	"</li>"
	+ "</ul>";
	
	var pai = document.getElementById('referencia');
	pai.appendChild(conteudo);
}

function htmlListarProdutosCheckin(produtos){
	
	var conteudo = document.createElement("div");
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu' style='top: -30px;'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a data-target='#quantidade' data-dismiss='modal' data-toggle='modal' onclick='itemVisializar("+produtos.id_produto+")'  >"+produtos.nome+"</a>"	
	+		"<img src='img/product.png' width='25' class='edit-estabe'/>"
	+	"</li>"
	+ "</ul>";
	
	var pai = document.getElementById('referencia');
	pai.appendChild(conteudo);
}

//--pesquisa feita na tela principal --//
function htmlListarProdutosPrincipal(produtos){
	document.getElementById("iten_nome").innerHTML = "Produtos encontrados";
	var conteudo = document.createElement("div");
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu' style='top: -30px;'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a onclick='retornarItens("+produtos.id_produto+")' >"+produtos.nome+"</a>"	
	+		"<img src='img/product.png' width='25' data-target='#editarProduto' data-toggle='modal' onclick='pegarIdProdutoEditar("+produtos.id_produto+")' class='edit-estabe'/>"
	+	"</li>"
	+ "</ul>";
	
	var pai = document.getElementById('referencia');
	pai.appendChild(conteudo);
}

//______________________________ ADICIONAR PRODUTO NA LISTA _______________________________________// 
function adicionarProdutoNaLista(flag){	
	var quantidade = parseInt($("#quantidadeDeProdutosParaAdicionarNaLista").val());
	var idLista = parseInt(window.localStorage.idListaClicada);
	var idProduto=parseInt(window.localStorage.idProdutoAdicionarLista);
	$.ajax({
        type: 'POST'
        , url: "http://192.168.1.99/Servidor/ListaDeProdutos.asmx/cadastrarProduto"
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',idProduto:'"+idProduto+"',quantidade:'"+quantidade+"'}"
		, success: function (data, status){                    
			var produtos = $.parseJSON(data.d);
			if(produtos=="OK"){
				alert("Produto cadastrado com sucesso!");
				
				if(flag == "checkin"){								//indica que essa função foi chamada do checkin
					window.location = "checkin.html";									//vai para tela de checkin
					return;
				}else{															//função chamada da lista
					window.location = "lista.html?id="+idLista;      
					return;		
				}
			
			}else{
				alert(produtos.mensagem);
				return;
			}
        }
        , error: function (xmlHttpRequest, status, err) {
            alert('Ocorreu um erro');
        }
    });	
}

//____________________________ RETORNAR ITENS ___________________________//
function retornarItens(idProduto){
	$.ajax({
            type: 'POST'
            , url: "http://192.168.1.99/Servidor/Item.asmx/retornarItem"
			, crossDomain:true
            , contentType: 'application/json; charset=utf-8'
            , dataType: 'json'
            , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idProduto:'"+idProduto+"'}"
            , success: function (data, status){
				var itens = $.parseJSON(data.d);
				
				//------------ ordenar -----------------//
				var i, j, preco,qualificacao,guardar;
				for (i = 1; i < itens.length; i++) {
				   qualificacao = itens[i].qualificacao;
				   guardar = itens[i];
				   preco = itens[i].preco;
				   j = i;
				   while((j>0) && 
				   (preco<itens[j-1].preco  || (qualificacao>itens[j-1].qualificacao && preco==itens[j-1].preco)))
				   {
						itens[j] = itens[j-1];
						j = j-1;
				   }
				   itens[j] = guardar;
				}	
				
				document.getElementById("referencia").innerHTML = "";
				document.getElementById("iten_nome").innerHTML = itens[0].nomeProduto;
				for(var t=0; t<itens.length; t++)	
				listaItens(itens[t]);					
            }
            , error: function (xmlHttpRequest, status, err) {
                alert('Ocorreu um erro no servidor');
            }
        });
	
}


////________________________Editar Produto_____________________////
function editarProduto(){
	var nomeDoProduto = $("#nomeDoProdutoEditado").val();
	var codigoDeBarras = $("#cod_barraEditado").val();
	var marca = $("#marcaDoProdutoEditado").val();
	var embalagem = $('select[name=embalagemDoProdutoEditado]').val(); 
	var quantidade = parseInt($("#quantidadeDoProdutoEditado").val());
	var unidade = parseInt($('select[name=unidadeDoProduto]').val());
	var idLista = parseInt(window.localStorage.idListaClicada);
	var idProduto = parseInt(window.localStorage.idProdutoEditar);
	
	var url="http://192.168.1.99/Servidor/ListaDeProdutos.asmx/criarProduto";
	var data="{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',idProduto:'"+idProduto+"',marca:'"+marca+"',nome:'"+nomeDoProduto+"',unidade:'"+unidade+"',embalagem:'"+embalagem+"',quantidade:'"+quantidade+"'}";
	
	if(codigoDeBarras.trim() !=''){
		url="http://192.168.1.99/Servidor/ListaDeProdutos.asmx/criarProdutoComCodigo";
		data="{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',idProduto:'"+idProduto+"',marca:'"+marca+"',nome:'"+nomeDoProduto+"',unidade:'"+unidade+"',embalagem:'"+embalagem+"',codigo:'"+codigoDeBarras+"'tipoCod:'"+tipoCod+"',quantidade:'"+quantidade+"'}";
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
					alert("Produto editado com sucesso!");
					window.location = "lista.html?id="+idLista;
					return;					
				}else{
					alert(retorno.messagem);
					return;
				}	
            }
            , error: function (xmlHttpRequest, status, err) {
                alert('Ocorreu um erro no servidor');
            }
        });
	}   
}

//____________________________Id Produto no localStorage___________________//
function adicionarIdProdutoLocalStorage(id){
	window.localStorage.idProdutoAdicionarLista=id;
}

//____________________________Id Produto no localStorage___________________//
function pegarIdProdutoEditar(id){
	window.localStorage.idProdutoEditar=id;	
}

//______ listar itens ________//
function listaItens(produto)
{
	var conteudo = document.createElement("div");
	conteudo.innerHTML =	
	 "<ul class='menu-principal listas-menu' style='top: -30px;'>"
	+		"<li class='list-group-item' style='margin-bottom: -25px;'> "
	+		"<a>"+produto.nomeEstabelecimento+"</a>"	
	+		"<a class='edit-estabe' style='color: #3379bd;'>"+(produto.preco).toFixed(2)+"</a>"	
	+		"<a class='edit-estabe' style='color: rgb(255, 94, 0);font-weight: bold;' >"+produto.qualificacao+"</a>"	
	+	"</li>"
	+ "</ul>";
	
	var pai = document.getElementById('referencia');
	pai.appendChild(conteudo);
}

function itemVisializar(idProduto){
	window.localStorage.itemVisializar = idProduto;
	window.localStorage.idProdutoAdicionarLista = idProduto;
}

function pesquisarPrincipal(){
	window.localStorage.pesquisarPrincipal = "pesquisar";
}