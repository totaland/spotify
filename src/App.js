import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as request from 'request'
import * as _ from 'lodash'
import * as yup from 'yup'

const Div = styled.div`
  padding: 3em;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  align-items: center;
`;

const FormStyled = styled(Form)`
  display: flex;
  flex-direction: column;
  max-width: 350px;
  width: 50%;
  min-width: 300px;
  align-items: center;
  max-height: 450px;
  min-height: 350px;
  height: 50%;
  border: solid 1px rgb(0, 0, 0, 0.2);
  justify-content: space-between;
  border-radius: 3px;
  -webkit-box-shadow: 0px 2px 5px 0px rgba(153, 153, 153, 1);
  -moz-box-shadow: 0px 2px 5px 0px rgba(153, 153, 153, 1);
  box-shadow: 0px 2px 5px 0px rgba(153, 153, 153, 1);
`;

const FieldStyled = styled(Field)`
  width: 80%;
  height: 2em;
  border-bottom: 1px solid #ccc;
  border-top: none;
  border-left: none;
  border-right: none;
  background-color: #fff;
  margin-top: 16px;
  margin-bottom: 8px;
  border-radius: 3px;
  font-size: 1rem;
  line-height: 2em;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
`;

const Button = styled.button`
  width: 80%;
  background-color: #4dd0e1;
  border: none;
  padding: 1em 2em;
  border-radius: 3px;
  color: white;
  margin-bottom: 2em;
  font-size: 1rem;
`;
const DivH1 = styled.div`
  background-color: #4dd0e1;
  width: 100%;
  height: 100px;
  align-items: center;
  justify-content: center;
  display: flex;
  overflow: hidden;
  color: white;
`;

const Error = styled.div`
  color: #ee6e73;
`;

const Li = styled.li`
    color: palevioletred;
    list-style: none;
`

const searchUrl = "https://api.spotify.com/v1/search?";
const authUrl = "https://accounts.spotify.com/authorize";
const client_id = process.env.REACT_APP_CLIENT_ID;
const client_secret = process.env.REACT_APP_CLIENT_SECRET;
const redirectUrl = "http%3A%2F%2Fspotifyhosting-spotifyenv.s3-website-ap-southeast-2.amazonaws.com%2F";
const authorize = authUrl + "?client_id=" + client_id + "&redirect_uri=" + redirectUrl + "&scope=user-read-private&response_type=token";
let access_Token = '';


const schema = yup.object({
    search: yup
        .string()
        .max(30, 'At most 30 chars')
});

function App() {
    let displayList =[];

    const initialValue = {
        accessToken : ""
    }
    const [token, setToken] = useState(initialValue);
    const [display, setDisplay] = useState(false);
    const [list, setList] = useState([]);
    useEffect(() => {
        const fetchData = () => {
            try {
                access_Token = window.location.href.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
                setToken(access_Token);
            } catch (e) {
                console.log(e);
            }

        };
        fetchData();
    }, []);

    function getList() {
        console.log(list);
        return (
            list.map((v,i) => {
                return <Li key={i}>{list[i]}</Li>;
            })
        )
    }

    function handleClick() {
        window.location.replace(authorize);
    }

    if(token.accessToken==="") {
        return(
            <Div>
                <Button onClick={handleClick}>LogIn</Button>
            </Div>
        )
    }
    else if(display !== false) {
        console.log(list);
        getList();
    }
    return (
        <Div>
            <Formik
                validationSchema={schema}
                initialValues={{search: ""}}
                validate={values => {
                    let errors = {};
                    if (!values.search) {
                        errors.search = "Search value is required";
                    }
                    return errors;
                }}
                onSubmit={(values, {setSubmitting}) => {
                    setTimeout(async () => {
                        displayList = [];
                        setList([]);
                        let url = searchUrl;
                        let str = values.search.replace(/[^A-Z0-9]+/ig, "_");
                        const arr = _.pull(Array.from(str), "_").reverse();
                        let Q = '';
                        let uri ='';
                        for(let i = arr.length; i--;) {
                            Q= arr[i];
                            uri = url.concat("q="+Q+"&type=track");
                            await fetch(uri, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${access_Token}`
                                }
                            }).then(res => res.json()).then(data => {
                                console.log(data);
                                for(let j = data.tracks.items.length; j--;) {
                                    let first = _.pull(Array.from(data.tracks.items[j].name), " ");
                                    if(first[0].toLowerCase() === arr[i]) {
                                        displayList.push(data.tracks.items[j].name);
                                        console.log(list);
                                        setList(displayList);
                                        return first[0];
                                    }
                                }
                            })
                        }
                        setSubmitting(false);
                        setDisplay(true);
                    }, 400);
                }}
            >
                {({isSubmitting}) => (
                    <Form type="submit" disable={isSubmitting}>
                        <FieldStyled type="text" name="search" placeholder={"Search"}/>
                        <ErrorMessage name="search" component={Error}/>
                    </Form>
                )}
            </Formik>
            <div>
                {getList()}
            </div>
        </Div>
    );
}

export default App;
