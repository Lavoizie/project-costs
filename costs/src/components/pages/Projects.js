import { useLocation } from "react-router-dom"
import Message from "../layout/Message"
import Container from '../layout/Container'
import Loading from "../layout/Loading"
import LinkButton from '../layout/LinkButton'
import styles from './Projects.module.css'
import ProjectCard from "../project/ProjectCard"
import { useEffect, useState } from "react"

function Projects (){

const [projects, setProject] = useState([])
const [removeLoading, setRemoveLoading] = useState(false)
const [ projectMessage, setProjectMessage ] = useState('')

const location = useLocation()
let message = '' 

if (location.state){
    message = location.state.message
}

useEffect( () => {
    setTimeout( () => {

        fetch ('http://localhost:5000/projects', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then( (resp) => resp.json() )
    .then( (data) => {
        console.log(data)
        setProject(data)
        setRemoveLoading(true)
    } )
    .catch ( (err) => console.log(err) )

    }, 300 )
}, [] )

function removeProject(id){
        fetch(`http://localhost:5000/projects/${id}`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'applications/json',
            },
        }).then((resp) => resp.json )
          .then((data) => {
            setProject(projects.filter ( (projects) => projects.id !==id ) )
            setProjectMessage ('Projeto Removido Com Sucesso!')
          } )
          .catch((err) => console.log(err))
    }

    return ( 
    <div className={styles.project_container} >
        <div className={styles.title_container} >
            <h1>Meus Projetos</h1>
            <LinkButton to="/newproject" text="Criar Projeto" />
        </div>
        {message && <Message type="sucess" msg={message} /> }
        {projectMessage && <Message type="sucess" msg={projectMessage} /> }
        <Container customClass="start" >
            { projects.length > 0 &&
              projects.map ( (project) => (
              <ProjectCard id={project.id}
                           name={project.name}
                           budget={project.budget}
                           category={project.category.name}
                           key={project.id}
                           handleRemove = {removeProject}
                           />
                ))}
                { !removeLoading && <Loading /> }
                {removeLoading && projects.length === 0 && (
                    <p>Não há projetos Cadastrados</p>
                )}
        </Container>
    </div>
    ) 
}

export default Projects