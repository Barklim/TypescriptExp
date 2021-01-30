import * as React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components/macro';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { reducer, sliceKey, loginModalActions } from './slice';
import {
  reducer as reducerReg,
  sliceKey as sliceKeyReg,
  registerModalActions,
} from '../RegisterModal/slice';
import { selectLoginModal } from './selectors';
import { loginModalSaga } from './saga';
import { registerModalSaga } from '../RegisterModal/saga';

import { useState } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useLoginMutation } from 'generated/graphql';
import { toErrorMap } from 'utils/toErrorMap';

interface Props {}

export function LoginModal(props: Props) {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectReducer({ key: sliceKeyReg, reducer: reducerReg });
  useInjectSaga({ key: sliceKey, saga: loginModalSaga });
  useInjectSaga({ key: sliceKeyReg, saga: registerModalSaga });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loginModal = useSelector(selectLoginModal);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useDispatch();

  const { changeModal } = loginModalActions;
  const changeModalReg = registerModalActions.changeModal;

  const [, login] = useLoginMutation();

  const schema = yup.object({
    usernameOrEmail: yup.string().required('Login is a required field'),
    password: yup.string(),
  });

  const [show, setShow] = useState(loginModal.show);

  const closeLoginModal = function () {
    setShow(false);
    dispatch(changeModal(false));
  };
  const handleShowReg = function () {
    setShow(false);
    dispatch(changeModal(false));
    dispatch(changeModalReg(true));
  };
  const handleClose = () => closeLoginModal();

  // Simulate network request
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  useEffect(() => {
    loginModal.show ? setShow(true) : setShow(false);
  }, [loginModal.show]);

  return (
    <>
      <Div>
        <Modal show={show} onHide={handleClose} animation={true} centered>
          <Row className="justify-content-md-center">
            <Col md={{ span: 3, offset: 4 }}>
              <HeaderLabel>Авторизация</HeaderLabel>
            </Col>
            <Col md={{ span: 1, offset: 3 }}>
              <Button variant="link" onClick={handleClose}>
                X
              </Button>
            </Col>
          </Row>
          <Formik
            validationSchema={schema}
            onSubmit={async (values, { setErrors }) => {
              await sleep(700);
              const response = await login(values);

              if (response.data?.login.errors) {
                setErrors(toErrorMap(response.data.login.errors));
              } else if (response.data?.login.user) {
                handleClose();
              }
            }}
            initialValues={{
              usernameOrEmail: '',
              password: '',
            }}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isValid,
              errors,
              isSubmitting,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Row>
                  <Form.Group
                    as={Col}
                    md={{ span: 8, offset: 2 }}
                    controlId="validationFormik01"
                  >
                    <Form.Label>Логин или Email:</Form.Label>
                    <Form.Control
                      type="text"
                      name="usernameOrEmail"
                      value={values.usernameOrEmail}
                      onChange={handleChange}
                      placeholder="Ваш ник или почта"
                      isValid={
                        touched.usernameOrEmail && !errors.usernameOrEmail
                      }
                      isInvalid={!!errors.usernameOrEmail}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid" tooltip>
                      {errors.usernameOrEmail}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group
                    as={Col}
                    md={{ span: 8, offset: 2 }}
                    controlId="validationFormik02"
                  >
                    <Form.Label>Пароль:</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="Пароль"
                      isValid={touched.password && !errors.password}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid" tooltip>
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Group>
                  <Row className="justify-content-md-center">
                    <Button
                      type="submit"
                      variant="success"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Загрузка…' : 'Войти'}
                    </Button>
                  </Row>
                  <Row className="justify-content-md-center">
                    <Button variant="light" onClick={handleShowReg}>
                      Регистрация
                    </Button>
                  </Row>
                </Form.Group>
              </Form>
            )}
          </Formik>
        </Modal>
      </Div>
    </>
  );
}

const Div = styled.div`
  /* padding-top: 120px; */
  /* padding-top: calc(12vh - 10px); */

  form {
    width: 552px;
    background-color: blue;
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeaderLabel = styled.div`
  padding-top: 20px;
`;