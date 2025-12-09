import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab | null>(null)

  useEffect(() => {
    getAllTabs()
  }, [])

  const getAllTabs = async () => {
    try {
      setLoading(true)
      const allTabs = await chrome.tabs.query({})
      setTabs(allTabs)
      console.log('All tabs:', allTabs)
    } catch (error) {
      console.error('Error getting tabs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentWindowTabs = async () => {
    try {
      const currentWindowTabs = await chrome.tabs.query({ currentWindow: true })
      setTabs(currentWindowTabs)
      console.log('Current window tabs:', currentWindowTabs)
    } catch (error) {
      console.error('Error getting tabs:', error)
    }
  }

  const getActiveTab = async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab) {
        setTabs([activeTab])
        console.log('Active tab:', activeTab)
      }
    } catch (error) {
      console.error('Error getting active tab:', error)
    }
  }

  const handleTabClick = (tab: chrome.tabs.Tab) => {
    setSelectedTab(tab)
    console.log('Selected tab full info:', tab)
  }

  const unloadTab = async (tabId: number | undefined) => {
    if (!tabId) return

    const confirmed = window.confirm('Are you sure you want to unload this tab? The tab will be discarded to free up memory.')
    if (!confirmed) return

    try {
      if (chrome.tabs.discard) {
        await chrome.tabs.discard(tabId)
        console.log('Tab unloaded:', tabId)
        getAllTabs()
        setSelectedTab(null)
      } else {
        alert('Tab discarding is not supported in this browser.')
      }
    } catch (error) {
      console.error('Error unloading tab:', error)
      alert('Failed to unload tab: ' + error)
    }
  }

  if (loading) {
    return <div>Loading tabs...</div>
  }

  return (
    <div style={{ width: '450px', padding: '10px', backgroundColor: '#ffffff', color: '#1a1a1a' }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2em', color: '#1a1a1a' }}>Tab Manager</h2>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button type="button" onClick={getAllTabs} style={{
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9em'
        }}>All Tabs</button>
        <button type="button" onClick={getCurrentWindowTabs} style={{
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9em'
        }}>Current Window</button>
        <button type="button" onClick={getActiveTab} style={{
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9em'
        }}>Active Tab</button>
      </div>

      {!selectedTab ? (
        <div>
          <div style={{ margin: '10px 0', fontSize: '0.9em', color: '#1a1a1a', backgroundColor: '#f0f8ff', padding: '8px', borderRadius: '4px', border: '1px solid #b0d4f1' }}>
            <div style={{ fontWeight: 'bold' }}>Total Tabs: {tabs.length}</div>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {tabs.map((tab, index) => (
              <div
                key={tab.id || index}
                onClick={() => handleTabClick(tab)}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #d0d0d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8f4fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {tab.favIconUrl && (
                  <img
                    src={tab.favIconUrl}
                    alt=""
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontWeight: tab.active ? 'bold' : 'normal',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.9em',
                    color: tab.discarded ? '#888888' : '#1a1a1a',
                    fontStyle: tab.discarded ? 'italic' : 'normal'
                  }}>
                    {tab.title || 'No title'} {tab.discarded && '(Unloaded)'}
                  </div>
                  <div style={{
                    fontSize: '0.75em',
                    color: tab.discarded ? '#999999' : '#5a5a5a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tab.url}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="button" onClick={() => setSelectedTab(null)} style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}>← Back to List</button>
            <button
              type="button"
              onClick={() => unloadTab(selectedTab.id)}
              disabled={selectedTab.discarded}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedTab.discarded ? '#cccccc' : '#dc3545',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedTab.discarded ? 'not-allowed' : 'pointer',
                fontSize: '0.9em',
                fontWeight: 'bold',
                opacity: selectedTab.discarded ? 0.6 : 1
              }}
            >
              {selectedTab.discarded ? 'Already Unloaded' : 'Unload Tab'}
            </button>
          </div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#1a1a1a' }}>Tab Details</h3>
          <div style={{ maxHeight: '450px', overflowY: 'auto', fontSize: '0.85em', color: '#1a1a1a' }}>
            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1em', color: '#2c3e50' }}>Basic Info</h4>
            <div><strong>ID:</strong> {selectedTab.id}</div>
            <div><strong>Title:</strong> {selectedTab.title}</div>
            <div style={{ wordBreak: 'break-all' }}><strong>URL:</strong> {selectedTab.url}</div>

            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1em', color: '#2c3e50' }}>Status & State</h4>
            <div><strong>Active:</strong> {selectedTab.active ? 'Yes' : 'No'}</div>
            <div><strong>Status:</strong> {selectedTab.status}</div>
            <div><strong>Pinned:</strong> {selectedTab.pinned ? 'Yes' : 'No'}</div>
            <div><strong>Highlighted:</strong> {selectedTab.highlighted ? 'Yes' : 'No'}</div>
            <div><strong>Incognito:</strong> {selectedTab.incognito ? 'Yes' : 'No'}</div>
            <div><strong>Discarded:</strong> {selectedTab.discarded ? 'Yes' : 'No'}</div>
            <div><strong>Auto-discardable:</strong> {selectedTab.autoDiscardable ? 'Yes' : 'No'}</div>

            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1em', color: '#2c3e50' }}>Window & Position</h4>
            <div><strong>Window ID:</strong> {selectedTab.windowId}</div>
            <div><strong>Index:</strong> {selectedTab.index}</div>
            <div><strong>Width:</strong> {selectedTab.width}px</div>
            <div><strong>Height:</strong> {selectedTab.height}px</div>

            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1em', color: '#2c3e50' }}>Audio & Media</h4>
            <div><strong>Audible:</strong> {selectedTab.audible ? 'Yes' : 'No'}</div>
            <div><strong>Muted:</strong> {selectedTab.mutedInfo?.muted ? 'Yes' : 'No'}</div>
            {selectedTab.mutedInfo?.reason && <div><strong>Muted Reason:</strong> {selectedTab.mutedInfo.reason}</div>}

            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1em', color: '#2c3e50' }}>Other</h4>
            <div><strong>Group ID:</strong> {selectedTab.groupId !== -1 ? selectedTab.groupId : 'None'}</div>
            <div><strong>Opener Tab ID:</strong> {selectedTab.openerTabId || 'None'}</div>
            {selectedTab.pendingUrl && <div style={{ wordBreak: 'break-all' }}><strong>Pending URL:</strong> {selectedTab.pendingUrl}</div>}
            {selectedTab.sessionId && <div><strong>Session ID:</strong> {selectedTab.sessionId}</div>}

            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1em', color: '#2c3e50' }}>Full JSON</h4>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '0.7em',
              overflow: 'auto',
              maxHeight: '200px',
              color: '#1a1a1a',
              border: '1px solid #d0d0d0'
            }}>
              {JSON.stringify(selectedTab, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
