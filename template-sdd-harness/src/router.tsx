import { Router, Route, Switch } from "wouter"
import {useHashLocation} from "wouter/use-hash-location"
import Layout from "@/pages/_layout"
import HomePage from "@/pages/home"
import TestPage from "@/pages/test"
import NotFoundPage from "@/pages/not-found"


export const AppRouter = () => (
  <Router hook={useHashLocation}>
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/test" component={TestPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Layout>
  </Router>
)

