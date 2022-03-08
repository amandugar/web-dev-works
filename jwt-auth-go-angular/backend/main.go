package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
)

const (
	PORT   = "1337"
	SECRET = "42isTheAnswer"
)

type JWTData struct {
	jwt.StandardClaims
	CustomClaims map[string]string `json:"custom,omitempty"`
}

type Account struct {
	Email    string  `json:"email"`
	Balance  float64 `json:"balance"`
	Currency string  `json:"currency"`
}

// func CORS(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

// 		// Set headers
// 		w.Header().Set("Access-Control-Allow-Headers:", "*")
// 		w.Header().Set("Access-Control-Allow-Origin", "*")
// 		w.Header().Set("Access-Control-Allow-Methods", "*")

// 		if r.Method == "OPTIONS" {
// 			w.WriteHeader(http.StatusOK)
// 			return
// 		}

// 		fmt.Println("ok")

// 		// Next
// 		next.ServeHTTP(w, r)
// 		return
// 	})
// }

func main() {
	c := mux.NewRouter()
	c.HandleFunc("/", hello)
	c.HandleFunc("/login", login)
	c.HandleFunc("/account", account)
	c.Use(mux.CORSMethodMiddleware(c))
	// handler := cors.Default().Handler(c)
	log.Println("Listening for connections on port: ", PORT)
	log.Fatal(http.ListenAndServe(":"+PORT, c))
}

func hello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from Go!")
}

func login(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Println(err)
		http.Error(w, "Login Failed!", http.StatusUnauthorized)
	}

	var userData map[string]string
	json.Unmarshal(body, &userData)
	fmt.Println(userData)

	// Demo - in real case scenario you'd check this against your database
	if userData["email"] == "admin@gmail.com" && userData["password"] == "admin" {
		claims := JWTData{
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: time.Now().Add(time.Hour).Unix(),
			},

			CustomClaims: map[string]string{
				"userid": "u1",
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString([]byte(SECRET))

		if err != nil {
			log.Println(err)
			http.Error(w, "Login failed!", http.StatusUnauthorized)
		}

		json, err := json.Marshal(struct {
			Token string `json:"token"`
		}{
			tokenString,
		})
		if err != nil {
			log.Println(err)
			http.Error(w, "Login failed!", http.StatusUnauthorized)
		}
		w.Write(json)
	} else {
		http.Error(w, "Login failed!", http.StatusUnauthorized)
	}
}

func account(w http.ResponseWriter, r *http.Request) {
	authToken := r.Header.Get("Authorization")
	authArr := strings.Split(authToken, " ")

	if len(authArr) != 2 {
		log.Println("Authentication header is invalid: " + authToken)
		http.Error(w, "Request failed!", http.StatusUnauthorized)
	}

	jwtToken := authArr[1]

	claims, err := jwt.ParseWithClaims(jwtToken, &JWTData{}, func(token *jwt.Token) (interface{}, error) {
		if jwt.SigningMethodHS256 != token.Method {
			return nil, errors.New("invalid signing algorithm")
		}
		return []byte(SECRET), nil
	})

	if err != nil {
		log.Println(err)
		http.Error(w, "Request failed!", http.StatusUnauthorized)
	}

	data := claims.Claims.(*JWTData)
	userID := data.CustomClaims["userid"]

	jsonData, err := getAccountData(userID)

	if err != nil {
		log.Println(err)
		http.Error(w, "Request failed!", http.StatusUnauthorized)
	}
	w.Write(jsonData)
}

func getAccountData(userID string) ([]byte, error) {
	output := Account{"amanamandugar@gmail.com", 3.14, "BTC"}
	json, err := json.Marshal(output)
	if err != nil {
		return nil, err
	}

	return json, nil
}
