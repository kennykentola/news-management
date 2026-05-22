import sys

try:
    with open('client/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
        text = f.read()
        
    text = text.replace("import AuditLog from './dashboard/AuditLog';", "import AuditLog from './dashboard/AuditLog';\nimport RejectedNews from './dashboard/RejectedNews';")
    text = text.replace("History\n}", "History,\n    Trash2\n}")
    
    sidebar_target = """icon={<CheckSquare size={20} />}
                            active={isActive('/dashboard/review')}
                            onClick={closeSidebar}
                        />
                    )}"""
    
    sidebar_replacement = """icon={<CheckSquare size={20} />}
                            active={isActive('/dashboard/review')}
                            onClick={closeSidebar}
                        />
                        <SidebarItem
                            to="/dashboard/rejected"
                            label="Trash"
                            icon={<Trash2 size={20} />}
                            active={isActive('/dashboard/rejected')}
                            onClick={closeSidebar}
                        />
                    )}"""
    text = text.replace(sidebar_target, sidebar_replacement)
    
    text = text.replace('<Route path="/review" element={<ReviewNews />} />', '<Route path="/review" element={<ReviewNews />} />\n                        <Route path="/rejected" element={<RejectedNews />} />')
    
    with open('client/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
        print("Dashboard.tsx updated")

    with open('client/src/pages/dashboard/ReviewNews.tsx', 'r', encoding='utf-8') as f:
        text = f.read()
        
    filter_target = """<Filter size={18} className="text-gray-500" />
                    </button>"""
                    
    filter_replacement = """<Filter size={18} className="text-gray-500" />
                    </button>
                    <Link to="/dashboard/rejected" className="p-2 px-4 bg-danger text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-black text-sm ml-2">
                        View Trash
                    </Link>"""
                    
    text = text.replace(filter_target, filter_replacement)
    
    with open('client/src/pages/dashboard/ReviewNews.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
        print("ReviewNews.tsx updated")

except Exception as e:
    print(f"Error: {e}")
