import { parse, v4 as uuidv4} from 'uuid'

import styles from './Project.module.css'

import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Loading from '../layout/Loading'
import Container from '../layout/Container'
import Message from '../layout/Message'
import ProjectForm from '../projects/ProjectForm'
import ServiceForm from '../service/ServiceForm'

function Project() {
    const { id } = useParams()

    const [project, setProject] = useState([])
    const [showProjectForm, setShowProjectForm] = useState(false)
    const [showServiceForm, setShowServiceForm] = useState(false)
    const [message, setMessage] = useState()
    const [type, setType] = useState()

    useEffect(() => {
        setTimeout(() => {
            fetch(`http://localhost:5000/projects/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((resp) => resp.json())
                .then((data) => {
                    setProject(data)
                })
                .catch((err) => console.log)
        }, 300)
    }, [id])

    function editPost(project) {
        // budget validation
        if (project.budget < project.cost) {
          setMessage('O Orçamento não pode ser menor que o custo do projeto!')
          setType('error')
          return false
        }
    
        fetch(`http://localhost:5000/projects/${project.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        })
          .then((resp) => resp.json())
          .then((data) => {
            setProject(data)
            setShowProjectForm(!showProjectForm)
            setMessage('Projeto atualizado!')
            setType('success')
          })
      }

      function createService(project) {
        // Verificar se o array de serviços está vazio
        if (project.services.length === 0) {
            console.error('O array de serviços está vazio.');
            return false;
        }
    
        // Obter o último serviço no array
        const lastService = project.services[project.services.length - 1];
    
        // Verificar se o último serviço está definido corretamente
        if (!lastService || typeof lastService.cost === 'undefined') {
            console.error('O último serviço no objeto project não foi definido corretamente ou não possui uma propriedade "cost".');
            return false;
        }
    
        // Obter o custo do último serviço
        const lastServiceCost = lastService.cost;
    
        // Calcular o novo custo total
        const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost);
    
        // Verificar se o novo custo total ultrapassa o orçamento do projeto
        if (newCost > parseFloat(project.budget)) {
            setMessage('Orçamento ultrapassado, verifique o valor do serviço');
            setType('error');
            // Remover o último serviço adicionado
            project.services.pop();
            return false;
        }

        project.cost = newCost

        // atualizar o projeto
        fetch( `http://localhost:5000/projects/${project.id}`,{
            method: 'PATCH',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(project)
        })
          .then((resp) => resp.json())
          .then((data) => {
            // exibir serviços
            console.log(data)
          })
          .catch((err) => console.log(err))
        
        // Se tudo estiver correto, retornar verdadeiro
        return true;
    }
    

    function toggleProjectForm () {
        setShowProjectForm(!showProjectForm)
    }

    function toggleServiceForm () {
        setShowServiceForm(!showServiceForm)
    }


    return (
    <>
        {project.name ? (
            <div className={styles.project_details}>
                <Container customClass="column">
                    {message && <Message type={type} msg={message} />}
                    <div className={styles.details_container}>
                        <h1>Projeto: {project.name}</h1>
                        <button className={styles.btn} onClick={toggleProjectForm}>
                           {!showProjectForm ? 'Editar Projeto' : 'Fechar'}
                        </button>
                        {!showProjectForm ? (
                            <div className={styles.project_info}>
                                <p>
                                    <span>Categoria:</span> {project.category.name}
                                </p>
                                <p>
                                    <span>Total de Orçamento</span> R${project.budget}
                                </p>
                                <p>
                                    <span>Total Utilizado</span> R${project.cost}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.project_info}>
                                <ProjectForm 
                                handleSubmit={editPost} 
                                btnText="Concluir Edição"
                                projectData={project}/>
                            </div>
                        )}
                    </div>
                    <div className={styles.service_form_container}>
                        <h2>Adicione um serviço:</h2>
                        <button className={styles.btn} onClick={toggleServiceForm}>
                           {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
                        </button>
                        <div className={styles.project_info}>
                            {showServiceForm && <ServiceForm
                              handleSubmit={createService}
                              btnText="Adicionar serviço"
                              projectData={project}
                            />}
                        </div>
                    </div>
                    <h2>Serviços</h2>
                    <Container customClass="start">
                        <p>Itens do serviços</p>
                    </Container>
                </Container>
            </div>
        ) : (
            <Loading />
        )}
    </>
    )
}

export default Project