import { Provider } from "react-redux"
import { store } from "./store"
import { TimersTable } from "./components/TimersTable"
import { Settings } from "./components/Settings"
import {
  initializeIcons,
  Pivot,
  PivotItem,
  Stack,
  ThemeProvider,
} from "@fluentui/react"

initializeIcons()

const useTabsParam = () => {
  const sp = new URLSearchParams(window.location.search)
  const v = sp.get("tabs")
  return v === "1" || v === "true"
}

export default function App() {
  const tabs = useTabsParam()

  return (
    <Provider store={store}>
      <ThemeProvider>
        {tabs ? (
          <Pivot>
            <PivotItem headerText="Timers">
              <Stack tokens={{ padding: 16 }}>
                <TimersTable />
              </Stack>
            </PivotItem>
            <PivotItem headerText="Settings">
              <Stack tokens={{ padding: 16 }}>
                <Settings />
              </Stack>
            </PivotItem>
          </Pivot>
        ) : (
          <Stack tokens={{ padding: 16, childrenGap: 24 }}>
            <TimersTable />
            <Settings />
          </Stack>
        )}
      </ThemeProvider>
    </Provider>
  )
}
