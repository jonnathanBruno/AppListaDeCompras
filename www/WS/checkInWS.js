var ID_USUARIO = window.localStorage.UsuarioId;						//id do usuario
var TOKEN = window.localStorage.UsuarioToken;						//token do usuario
var string = window.localStorage.produtoRecemAdicionado;			//string do localstorage com os id das listas e dos produtos recem adicionados no checkin
if(string == undefined){											//se string for indefinida
	window.localStorage.produtoRecemAdicionado = "";				//crie a variavel no localStoragee
	string = window.localStorage.produtoRecemAdicionado;			//salve na variavel string
}
var produtosRecemAdicionado = string.split(",");					//converter string em array


var estabelecimentos = [];
//__________________ ABRIR MODAL CHECKIN _____________________//
function abrirModalCheckin(flagCheckin){

	if(flagCheckin == "principal" || flagCheckin=="estabelecimento"){
		$.ajax({
			type: 'POST'
			, url: "http://192.168.1.102/Servidor/ListaDeProdutos.asmx/listarListas" 
			, crossDomain:true
			, contentType: 'application/json; charset=utf-8'
			, dataType: 'json'						
			, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"'}"
			, success: function (data, status){                    
				var listas = $.parseJSON(data.d);
				document.getElementById("listasCheckin").innerHTML = "";
				
					if(listas.length==0){
						var select = document.createElement("option");
						select.setAttribute("id","0");
						select.innerHTML = "Nenhuma lista cadastrada";
						var pai = document.getElementById("listasCheckin");
						pai.appendChild(select);
						return;
					}
					
				
					for(var i=0; i<listas.length; i++){

					var select = document.createElement("option");
					select.setAttribute("value",listas[i].id_listaDeProdutos);
					select.innerHTML = listas[i].nome;
					var pai = document.getElementById("listasCheckin");
					pai.appendChild(select);
					}
					
			}
			, error: function (xmlHttpRequest, status, err) {
				alert("Ocorreu um erro no servidor");
			}
		});
	}
	
	if(flagCheckin == "principal" || flagCheckin=="lista"){
		$.ajax({
			type: 'POST'
			, url: "http://192.168.1.102/Servidor/Estabelecimento.asmx/listarEstabelecimento"
			, crossDomain:true
			, contentType: 'application/json; charset=utf-8'
			, dataType: 'json'
			, data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',nome:'',bairro:'',cidade:''}"
			, success: function (data, status){                    
				estabelecimentos = $.parseJSON(data.d);
				calcularEstabProximo(estabelecimentos); 
			}
			, error: function (xmlHttpRequest, status, err) {
				alert("Ocorreu um erro no servidor");
			}
		});
	}
	
	$('#myModalCheckin').modal('show');
}

//_________________ ESCOLHER ESTABELECIMENTO ___________________//
function escolherEstabelecimento(){										                   
	var estabelecimentosFormatados = [];
	
	for(var i=0; i<estabelecimentos.length; i++)
	estabelecimentosFormatados[i] = estabelecimentos[i].nome+" - "+estabelecimentos[i].bairro;
	
	$("#estabCheckin").autocomplete({ source: estabelecimentosFormatados}); 
}

//__________________ INICIAR CHECKIN __________________________//
function iniciarCheckin(flagCheckin){
	

	if(flagCheckin=="principal"){
		var idLista = $("#listasCheckin").val();
		window.localStorage.idListaClicada = idLista;
			if(document.getElementById("0") != null){
				alert("Nenhuma lista cadastrada");
				return;
			}
	}
	
	if(flagCheckin=="lista"){
		var idLista = window.localStorage.idListaClicada;
	}	
	
	if(flagCheckin=="estab"){
			if(document.getElementById("0") != null){
				alert("Nenhuma lista cadastrada");
				return;
			}
		var idLista = $("#listasCheckin").val();
		var queries = {};
		$.each(document.location.search.substr(1).split('&'), function(c,q){
			var i = q.split('=');
			queries[i[0].toString()] = i[1].toString();
		});

		var idEstabelecimento=queries['id'];
	}	
	else{
		var estabelecimento = $("#estabCheckin").val();
		var aux=0;
		
		for(var a=0; a<estabelecimento.length; a++)
			if(estabelecimento[a]!= "-")
			aux++;
			else break;
			
		var nomeEstabelecimento = estabelecimento.substring(0,aux-1);
		
		for(var u=0; u<estabelecimentos.length; u++)
			if(estabelecimentos[u].nome==nomeEstabelecimento){
			var idEstabelecimento = estabelecimentos[u].id_estabelecimento;
			break;}
	}	
	
		
	window.localStorage.listaClicadaCheckin = idLista;
	window.localStorage.estabelecimentoClicadoCheckin = idEstabelecimento;
	window.location = "checkin.html";
}

//_________________ LISTA PRODUTOS PARA SER REALIZADO O CHECKIN _________________//
function retornarProdutosCheckIn(){	

	var idLista = window.localStorage.listaClicadaCheckin;							
	var idEstabelecimento =	window.localStorage.estabelecimentoClicadoCheckin; 		

	$.ajax({																		
        type: 'POST'
        , url: "http://192.168.1.102/Servidor/ListaDeProdutos.asmx/retornarItens" 
		, crossDomain:true
        , contentType: 'application/json; charset=utf-8'
        , dataType: 'json'
        , data: "{idUsuario:'"+ID_USUARIO+"',token:'"+TOKEN+"',idLista:'"+idLista+"',idEstabelecimento:'"+idEstabelecimento+"'}" 
        , success: function (data, status){                    
			var produtos = $.parseJSON(data.d);								
			document.getElementById("conteudo").innerHTML = "";		
				for(var i=0; i<produtos.length ;i++)						
				htmlListarProdutos2(produtos[i]);							
        }
        , error: function (xmlHttpRequest, status, err) {					
            alert('Ocorreu um erro no servidor');							
        }
    });
}

//___________________________ FUNÇÃO GUARDAR ITENS ________________________________//
var itens = [];
var acessoItens = 0;
var total = 0;
function guardarItem(idProduto){
	modalEditarPreco(idProduto);
	document.getElementById("totalLista").innerHTML="";
	
	var checkBox = document.getElementById(idProduto);
	var quantidade = parseFloat(document.getElementById(idProduto+"quant").title);
	var precoProduto = parseFloat(document.getElementById(idProduto).alt);
	var idProdutoEditado = document.getElementById(idProduto).accessKey;
	var produtoCadastrado = document.getElementById(idProduto).align;
	var storedProdutos = JSON.parse(document.getElementById(idProduto).lang);
	
	if(checkBox.checked == true){	
	
		document.getElementById(idProduto+"prod").className = "nome-produto-riscar";  		
		total += quantidade*precoProduto;
		document.getElementById("totalLista").innerHTML = "Total: R$ "+total.toFixed(2);
		
		if(idProdutoEditado != ""){
			storedProdutos.id_produto = parseFloat(idProdutoEditado);
			idProduto = parseFloat(idProdutoEditado);			
		}else if(produtoCadastrado == "0"){
			storedProdutos.id_produto = parseFloat(produtoCadastrado);
			idProduto = parseFloat(produtoCadastrado);	
		}
		
		itens[acessoItens++] =  storedProdutos;
		console.log(itens);
	}else{
	
		document.getElementById(idProduto+"prod").className = "nome-produto-desriscar";  		
		total-= quantidade*precoProduto;
		document.getElementById("totalLista").innerHTML = "Total: R$ "+total.toFixed(2);
		
		if(idProdutoEditado != ""){
			storedProdutos.id_produto = parseFloat(idProdutoEditado);
			idProduto = parseFloat(idProdutoEditado);			
		}else if(produtoCadastrado == "0"){
			storedProdutos.id_produto = parseFloat(produtoCadastrado);
			idProduto = parseFloat(produtoCadastrado);	
		}	
		
		for(var i = itens.length - 1; i >= 0; i--) {
			if(itens[i].id_produto === idProduto) {
			   itens.splice(i, 1);
			   acessoItens--;
			}
		}
		console.log(itens);
	}
}

//___________________ MODAL EDITAR PRECO__________________________//
function modalEditarPreco(idProduto){
	var checkBox = document.getElementById(idProduto);
	
	if(checkBox.checked == true){	
		window.localStorage.idProdutoAbertoModal = idProduto;
		var preco = document.getElementById(idProduto).title;
		document.getElementById("preco").placeholder = preco;
		document.getElementById("preco").value = "";
		
	$('#confirmar_preco').modal('show');
	}
}

//___________________________ EDITAR PRODUTOS ___________________________//
function editarPreco(){
	var idProduto = window.localStorage.idProdutoAbertoModal;
	var preco = document.getElementById(idProduto).alt;
	var precoColocado = document.getElementById("preco").value;
	var storedProdutos = JSON.parse(document.getElementById(idProduto).lang);
	
	if(preco.match(/^-?\d*\.?\d+$/) && precoColocado!="")
	{
		var quantidade = parseFloat(document.getElementById(idProduto+"quant").title);
		var valorEditado =  document.getElementById("preco").value;
		var valorAntigo = document.getElementById(idProduto).alt;

		total -= quantidade*valorAntigo;
		
		var valorPreco = document.getElementById(idProduto+"preco");
		document.getElementById(idProduto).title = valorEditado;
		
		//------- atualiza id no array --------//
			for(var i = itens.length - 1; i >= 0; i--) {
				if(itens[i].id_produto == idProduto) {
				   itens.splice(i, 1);
				   acessoItens--;
				}
			}
			
			if(document.getElementById(idProduto).align == 0){
				storedProdutos.id_produto = -0;
				itens[acessoItens++] = storedProdutos;
				document.getElementById(idProduto).accessKey = "-0";
			}else{
				storedProdutos.id_produto = parseFloat("-"+document.getElementById(idProduto).id);
				itens[acessoItens++] = storedProdutos;
				document.getElementById(idProduto).accessKey = "-"+document.getElementById(idProduto).id;
			}	
			
		//-----------------------------------//	
		document.getElementById(idProduto).alt = valorEditado;
		
		valorPreco.innerHTML = "R$ " +valorEditado;
		$('#confirmar_preco').modal('hide');
		
		total += quantidade*valorEditado;
		document.getElementById("totalLista").innerHTML = "Total: R$ "+total.toFixed(2);	
	}else{
		alert("Coloque um preco em um formato valido!");
	}
}	

function checkout(){
	localNotificationCheckin('CheckIn finalizado!','Checkin finalizado com sucesso!');
	document.getElementById("totalCheckout").innerHTML = "Total: R$ "+total.toFixed(2);
}

window.localNotificationCheckin = function(titulo,menssagem)
{
    window.plugin.notification.local.add({
    id:      1,
    title:   titulo,
    message: menssagem,
    repeat:  'weekly'
    });
}


//________________ LISTAR PRODUTOS _______________________//
function htmlListarProdutos2(produtos){
	var conteudo = document.createElement("div");
	
	//---- controle marca ---//
	if(produtos.marca == "")
		var marca = "Marca nao cadastrada";
	else
		var marca = produtos.marca;
		
	//---- controle preço ---//	
	if(produtos.preco == 0)
		var preco = "Sem valor cadastrado";
	else
		var preco = "R$ "+(produtos.preco).toFixed(2);
		
	/*--- Controle de proutos pré cadastrados no checkin ---*/
		for(var j=0 ;j<produtosRecemAdicionado.length;j++){													//pecorrer string de idLista e idProdutos 
			var stringListaProduto = produtosRecemAdicionado[j];											//id da lista e do produto
			var idLista = "";																				//variavel id da lista
			var id_produto = "";																			//variavel id do produto
			for(var u=0;u<stringListaProduto.length;u++){													//for para repartir a string
				if(stringListaProduto[u] != "-"){															//enquanto nao encontra a barra(-)
					idLista+= stringListaProduto[u];														//salva o id da lista
				}else{																						//se encontrou a barra(-)
					id_produto = stringListaProduto.substring((u+1),stringListaProduto.length);				//salva o id do produto
					break;
				}
			}
			if(id_produto == produtos.nome && window.localStorage.listaClicadaCheckin == idLista ){			//se for algum produto recem adicionado na lista respectiva
				var idProdutoAdicionado = 0;																			//o id desse produto será 0
				break;
			}else{																							//se nao for
				var idProdutoAdicionado = produtos.id_produto;														//o id do produto será seu id de origem
			}
		}
		/*------*/
		
	var jsonProdutos = JSON.stringify(produtos);	
	conteudo.innerHTML = 
	 "<ul class='menu-principal listas-checkin'>"
	+	"<li class='list-group-item'>"
	+		 "<div class='icone-remover-produto-checkin'>"
	+			 "<img src='img/remove.png' width='20' />"
	+		"</div>"
	+		 "<a href='#' id='"+produtos.id_produto+"prod"+"'> "+produtos.nome+" </a>"
	+		"<span class='sub-titulo-menu' id='"+produtos.id_produto+"preco"+"'> "+preco+" </span>"
	+		"<div class='subtitulo-produto' title='"+produtos.quantidade+"' id='"+produtos.id_produto+"quant"+"'>"
	+			"Quantidade: "+produtos.quantidade+"<br /> "+marca+" </div>"
	+		"<div class='btn-acao'>"
	+			"<div class='checkbox checkin-box'>"
	+				"<label>"
	+					"<input type='checkbox' lang='"+jsonProdutos+"' align='"+idProdutoAdicionado+"' alt='"+produtos.preco+"' title='"+preco+"' id='"+produtos.id_produto+"' onclick='guardarItem("+produtos.id_produto+")'>"
	+				"</label>"
	+			"</div>"
	+		"</div>"
	+	"</li>"
	+"</ul>"
	
	var pai = document.getElementById("conteudo");
	pai.appendChild(conteudo);	
}

//_____________________ ACHAR ESTABELECIMENTO MAIS PRÓXIMO ____________________//
function distLatLong(lat1,lon1,lat2,lon2) {
  var R = 6371; // raio da terra
  var Lati = Math.PI/180*(lat2-lat1);  //Graus  - > Radianos
  var Long = Math.PI/180*(lon2-lon1); 
  var a = 
	Math.sin(Lati/2) * Math.sin(Lati/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(Long/2) * Math.sin(Long/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // distância en km
  return((d*1).toFixed(4));
}

function deg2rad(degree) {
    return degree * (Math.PI / 180);
}

function calcularEstabProximo(estabelecimentos){
var latitudeGeolocation = window.localStorage.lat;												
var longitudeGeolocation = window.localStorage.lon;	
	
	var menorDistancia = "";
	var estabelecimentoMenorDistancia;
	var indice = 0;
	for(var pos=0; pos<estabelecimentos.length; pos++){
		var distancia = distLatLong(latitudeGeolocation,longitudeGeolocation,estabelecimentos[pos].latitude,estabelecimentos[pos].longitude);
		if(menorDistancia == "" && distancia<1.0){
			menorDistancia = distancia;
			estabelecimentoMenorDistancia = estabelecimentos[pos];
			indice = pos;
		}else if(distancia<menorDistancia && distancia<1.0){
			menorDistancia = distancia;
			estabelecimentoMenorDistancia = estabelecimentos[pos];
			indice = pos;
		}
	}
	
	if(menorDistancia != ""){	
		alert("O estabelecimeto mais proximo e o "+estabelecimentoMenorDistancia.nome +"\n"+ estabelecimentoMenorDistancia.bairro);					
	}
}