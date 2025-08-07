const Tour = require('./../Models/tourModels'); // Importing the Tour model

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// exports.checkID = (req, res, next, val) => {
//     // if (Number(req.params.id) * 1 > tours.length) {
//     //   return res.status(404).json({
//     //     status: '404',
//     //     message: 'Invalid Id',
//     //   }
    
    
//   console.log(`Tour id is: ${val}`);
//   //console.log('req params id ', req.params.id, 'tours len ', tours.length);
//   next();
// };



//Route Handlers
exports.getAllTours = (req, res) => {
  //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
  // res.status(200).json({
  //   status: 'success',
  //   ResponseTime: req.resquestTime,
  //   results: tours.length,
  //   data: {
  //     tours: tours,
  //   },
  // });
}

// app.get('/api/v1/tours/:id', (req, res) => {
//   console.log(req.params)
//   //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
//   res.status(200).json({
//     status: 'success',
//   //   results: tours.length,
//   //   data: {
//   //     tours: tours,
//   //   },
//   });
// });

exports.addNewTour = async (req, res) => {
  // const newTour = new tour({});
  // newTour.save(); //Como se fazia antes de saber como se faz bem

  const newTour = await Tour.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
}

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; //Converting to number
  console.log(id);
  //// ...PARA A FUNÇÃO ABAIXO

  // A função find recebe uma callback function como argumento.
  // Uma callback function é uma função passada como parâmetro para outra função, que será chamada (executada) dentro da função principal.
  // Neste caso, para cada elemento do array tours, a função find executa a callback function: el => el.id === req.params
  // - 'el' representa o elemento atual do array tours em cada iteração.
  // - 'el.id' é o id do elemento atual.
  // - 'req.params' deveria ser 'req.params.id' para comparar corretamente o id do tour com o parâmetro da requisição.
  // A função find retorna o primeiro elemento para o qual a callback retorna true.
  // Exemplo passo a passo:
  //   1ª iteração: el = tours[0], verifica se tours[0].id === req.params
  //   2ª iteração: el = tours[1], verifica se tours[1].id === req.params
  //   ...até encontrar um elemento que satisfaça a condição.
  // O resultado é atribuído à variável 'tours', mas isso pode causar confusão, pois tours era um array e agora será um único objeto ou undefined.
  // Recomenda-se usar outro nome, como 'tour'.

  // Correção sugerida:
  // const tour = tours.find(el => el.id === req.params.id);

  // ...existing
  const tour = tours.find((el) => el.id === id);
  console.log(tour);

  //(req,res) => é o que vem do cliente, e o que é enviado de volta para o cliente, tipicamente chamamos de route handler
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    data: {
      tours: tour,
    },
  });
};

exports.updateTour = (req, res) => {

  const id = req.params.id * 1; //Converting to number
  //recolher o input vindo do client
  console.log(req.body);
  //encontrar o tour que tem o id igual ao id do parametro
  const tour = tours.find((el) => el.id === id);
  console.log(tour);
  //substituir apenas a tour selecionada
  if (!tour) {
    return res.status(404).json({
      status: '404',
      message: 'Invalid Id',
    });
  }
  //atualizar o tour
  // Esta linha copia todas as propriedades do objeto req.body para o objeto tour existente,
  // sobrescrevendo (atualizando) quaisquer propriedades de tour que também existam em req.body.
  // O método Object.assign modifica o objeto tour original, não cria um novo objeto.
  // Exemplo: se req.body = { name: "Novo Nome" }, então tour.name será atualizado para "Novo Nome".
  const updatedTour = Object.assign(tour, req.body); //
  console.log(updatedTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: updatedTour,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1; //Converting to number
  //Identificar o objeto com o id que é para eliminar
  // Supondo que 'tours' é um array de objetos, cada um com uma propriedade 'id'.
  // Exemplo: [{id: 1, nome: 'Tour A'}, {id: 2, nome: 'Tour B'}, ...]

  // O método findIndex procura o índice do primeiro elemento que satisfaz a condição dada.
  // 'el' representa cada elemento do array durante a iteração.
  // 'el => el.id === id' é uma arrow function que retorna true se o id do elemento for igual ao id procurado.
  const index = tours.findIndex((el) => el.id === id);
  console.log(index);
  // O método splice remove elementos do array.
  // O primeiro argumento é o índice inicial para remoção (aqui, o índice encontrado).
  // O segundo argumento é o número de elementos a remover (aqui, 1 elemento).
  tours.splice(index, 1);
  tours.forEach((tour, idx) => {
    tour.id = idx;
  });
  if (index === -1) {
    return res.status(404).json({
      status: '404',
      message: 'Invalid Id',
    });
  }
  //Eliminar o objeto com o ID e orientar a ordem dos outros
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(204).json({
        status: 'success',
        data: null,
        message: 'Apagado com sucesso',
      });
    }
  );
  console.log(`deleted Tour ${id} with success`);
};