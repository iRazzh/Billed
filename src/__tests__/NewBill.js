/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js";
import Store from "../app/Store"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      // Jest expression for being true = toBe(true) | toBeTruthy();
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();
    })
  })
  describe("When I want to create a new Bill", () => {
    // Vérifie que la page newBill apparaîsse bien
    test("Then show the new bill page", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    });
    // Vérifie que le formulaire de NewBill apparaît bien
    test("Then the form should appear", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillInit = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    });
    
    // Vérifie si un fichier est bien chargé
    test("Then verify the file bill", async() => {
      jest.spyOn(mockStore, "bills")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }     
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));

      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');
      billFile.addEventListener("change", handleChangeFile);     
      userEvent.upload(billFile, file)
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  });
})

// POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate on New Bills page", () => {
    test("he will create a New Bill (post)", async () => {
      jest.mock('../app/Store');
      const newBill = { 
        email: 'test@post.fr',
        type: "Employee",
        name:  "Frais de carburants",
        amount: 250,
        date:  "2022/06/25",
        vat: 20,
        pct: 20,
        commentary: "Success !",
        fileUrl: "chemin/du/fichier",
        fileName: "justificatif-23.jpeg",
        status: 'accepted'
      }
      Store.bill = () => ({ newBill, post: jest.fn().mockResolvedValue() })
      const getSpy = jest.spyOn(Store, "bill")
      const postReturn = Store.bill(newBill)
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(postReturn.newBill).toEqual(newBill)
    })
  })
})