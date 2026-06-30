create database MNE;
use MNE;


create table Usuario (
    id_usuario int primary key,
    nome varchar(100),
    nascimento date not null,
    email varchar(100) unique,
    senha varchar(255),
    tipo varchar(20)
);

DELETE FROM loja WHERE id_loja = 0;
SELECT * FROM encomenda WHERE id_usuario = 2;
SELECT * FROM carrinho;
create table Empreendedor (
    id_empreendedor int primary key,
    id_usuario int,
	nome varchar(100) not null,
    senha varchar(255),
    cpf varchar(11) unique,
    tipo varchar(20),
    foreign key (id_usuario) references Usuario(id_usuario)
);


alter table Empreendedor
modify column id_empreendedor int auto_increment;

create table Loja (
    id_loja int primary key,
    id_empreendedor int,
    nome varchar(100),
    descricao varchar(255),
    foto_logo varchar(255),
    horario_funcionamento varchar(100),
    ativa varchar(10),
    foreign key (id_empreendedor) references Empreendedor(id_empreendedor)
);

create table Categoria (
    id_categoria int primary key,
    nome varchar(100),
    descricao varchar(255)
);

create table Produto (
    id_produto int auto_increment primary key,
    id_loja int,
    id_categoria int,
    nome varchar(100),
    descricao varchar(255),
    preco float,
    foto varchar(255),
    disponivel varchar(10),
    foreign key (id_loja) references Loja(id_loja),
    foreign key (id_categoria) references Categoria(id_categoria)
);


create table Avaliacao (
    id_avaliacao int primary key,
    id_usuario int,
    id_loja int,
    nota int,
    comentario varchar(255),
    data_avaliacao date,
    foreign key (id_usuario) references Usuario(id_usuario),
    foreign key (id_loja) references Loja(id_loja)
);

create table Carrinho (
    id_carrinho int primary key,
    id_usuario int,
    data_criacao date,
    statusC varchar(20),
    foreign key (id_usuario) references Usuario(id_usuario)
);

create table ItemCarrinho (
    id_item_carrinho int primary key,
    id_carrinho int,
    id_produto int,
    quantidade int,
    foreign key (id_carrinho) references Carrinho(id_carrinho),
    foreign key (id_produto) references Produto(id_produto)
);

create table Encomenda (
    id_encomenda int primary key,
    id_usuario int,
    data date,
    status varchar(100),
    valor_total float,
    observacao varchar(255),
    foreign key (id_usuario) references Usuario(id_usuario)
);

create table ItemEncomenda (
    id_item_encomenda int primary key,
    id_encomenda int,
    id_produto int,
    quantidade int,
    preco_unitario float,
    subtotal float,
    foreign key (id_encomenda) references Encomenda(id_encomenda),
    foreign key (id_produto) references Produto(id_produto)
);

create table Retirada (
    id_retirada int primary key,
    id_encomenda int,
    codigo_retirada varchar(20) unique,
    nome varchar(70),
    data_retirada date,
    foreign key (id_encomenda) references Encomenda(id_encomenda)
);

create table Sugestao (
    id_sugestao int primary key,
    id_usuario int,
    data date,
    parametros varchar(255),
    foreign key (id_usuario) references Usuario(id_usuario)
);

create table ItemSugestao (
    id_item_sugestao int primary key,
    id_sugestao int,
    id_produto int,
    pontuacao float,
    foreign key (id_sugestao) references Sugestao(id_sugestao),
    foreign key (id_produto) references Produto(id_produto)
);

select * from Usuario;
select * from Empreendedor;

select * from loja;

alter table loja
modify column ativa tinyint(1);

SHOW TABLES;
DESCRIBE carrinho;
DESCRIBE itemcarrinho;
DESCRIBE encomenda;
DESCRIBE itemencomenda;
DESCRIBE retirada;
