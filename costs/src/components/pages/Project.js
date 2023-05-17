import {parse, v4 as uuidv4} from 'uuid'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from '../layout/Container'
import Loading from '../layout/Loading'
import Message from '../layout/Message'
import ProjectForm from '../project/ProjectForm'
import ServiceForm from '../service/ServiceForm'
import ServiceCard from '../service/ServiceCard'
import styles from './Project.module.css'

function Project () {
    
    const {id} = useParams()    

const [project, setProject] = useState ([])
const [services, setSetvices] = useState ([])
const [showProjectForm, setShowProjectForm] = useState(false)
const [showServiceForm, setShowServiceForm] = useState(false)
const [message, setMessage] = useState()
const [type, setType] = useState()

    useEffect ( () =>{
        setTimeout( () => {
            fetch (`http://localhost:5000/projects/${id}`,{
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
            },
        })
          .then( (resp) => resp.json() )
          .then( (data) => {
            setProject(data)
            setSetvices (data.services)
          } )
         .catch((err) => console.log)
        }, 300 )
        }, [id]
        )

function editPost (project){
    setMessage('')

    // buget validation
    if (project.budget < project.cost){
        //Mensagem de exibição de orçamento extourado
        setMessage ('O orçamento não pode ser menos que o custo do Projeto!')
        setType('error')
        setTimeout( () => {setMessage("");}, 3000 )
        return false
    }
    fetch (`http://localhost:5000/projects/${project.id}`,{
        method: 'PATCH',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify(project),
    })
    .then(resp => resp.json())
    .then((data) => {
        setProject(data)
        setShowProjectForm(false)
        //Messagem de Projeto atualizado...
        setMessage('Projeto Atualizado!')
        setType('success')
    })
    .catch(err => console.log(err))
}

function createService(project){
    setMessage('')
    //last service
    const lastService = project.services[project.services.length - 1]

    lastService.id = uuidv4()

    const lastServiceCost = lastService.cost

    const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)

    if (newCost > parseFloat(project.budget)) {
        setMessage ('Orcamento ultrapassado, verifique o valor do serviço.')
        setType('error')
        project.services.pop()
        return false
    }
    //add service cost to project total cost
    project.cost = newCost
     
    // Update project Cost
    fetch(`http://localhost:5000/projects/${project.id}`,{
        method: 'PATCH',
        headers:{
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
})
    .then((resp) => resp.json())
    .then((data) => {
        setShowServiceForm(false)
    })
    .catch((err) => console.log(err))
}

function removeService(id, cost){
    setMessage('')
    const servicesUpdated = project.services.filter (
        (service) => service.id !== id,
    )

    const projectUpdated = project

    projectUpdated.services = servicesUpdated
    projectUpdated.cost = parseFloat(projectUpdated.cost) - parseFloat(cost)
    
    fetch (`http://localhost:5000/projects/${projectUpdated.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectUpdated)
    })
      .then((resp) => resp.json())
      .then((data) =>{
        setProject(projectUpdated)
        setSetvices(servicesUpdated)
        setMessage('Serviço removido com sucesso!')
        })
        .catch((err) => console.log(err))
}

function toggleProjectForm (){
    setShowProjectForm (!showProjectForm)
}

function toggleServiceForm(){
    setShowServiceForm(!showServiceForm)
}

    return(
    <>
        {project.name ? ( 
            <div className={styles.project_details} >  
                <Container customClass="column">
                    {message && <Message type={type} msg={message} /> }
                    <div className={styles.details_container} >
                        <h1>Projeto: {project.name}</h1>
                        <button className={styles.btn} onClick={toggleProjectForm}>
                            {!showProjectForm ? 'Editar Projeto' : 'Fechar'}
                        </button>
                        {!showProjectForm ? (
                            <div className={styles.project_info} > 
                                <p>
                                    <span>Categoria: </span> {project.category.name}
                                </p>
                                <p>
                                    <span>Total de Orçamento: </span> {project.budget}
                                </p>
                                <p>
                                    <span>Total Utilizado: </span> R${project.cost}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.project_info} >
                                <ProjectForm
                                handleSubmit={editPost}
                                btnText = "Concluir"
                                projectData={project}
                                />
                            </div>
                        )}
                    </div>
                    <div className={styles.service_form_container}>
                        <h2>Adicione um serviço:</h2>
                        <button className={styles.btn} onClick={toggleServiceForm} >
                            {!showServiceForm ? 'Adicionar serviço': 'Fechar'}
                        </button>
                        <div className={styles.project_info} >
                            {showServiceForm && <ServiceForm 
                            handleSubmit={createService}
                            btnText ="Adicionar Serviço"
                            projectData={project}
                            />
                             }
                        </div>
                    </div>
                    <h2>Serviços</h2>
                    <Container customClass="start" >
                            {services.length >0 &&
                                services.map((service) =>(
                                    <ServiceCard
                                        id={service.id}
                                        name={service.name}
                                        cost={service.cost}
                                        description={service.description}
                                        key={service.key}
                                        handleRemove={removeService}
                                    />
                                ))
                            }
                            { services.length === 0 && <p>Não há serviços cadastrados.</p> }
                    </Container>
                </Container>
            </div>
                ) : ( <Loading/> ) }
    </>
    )
}

export default Project