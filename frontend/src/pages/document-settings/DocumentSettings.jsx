import React, { useState } from 'react'
import Categories from './Categories'
import Types from './Types'
import Volumes from './Volumes'

const tabs = [
    { value: 'categories', label: 'Categories' },
    { value: 'types', label: 'Types' },
    { value: 'volumes', label: 'Volumes' },
]

export default function DocumentSettings() {
    const [active, setActive] = useState('categories')

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Document Settings</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage document categories, types and volumes</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setActive(tab.value)}
                            className={
                                `px-4 py-2 text-sm font-semibold rounded-t-xl transition focus:outline-none ${
                                    active === tab.value
                                        ? 'bg-slate-100 text-slate-900 border border-slate-200 border-b-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div>
                    {active === 'categories' && <Categories />}
                    {active === 'types' && <Types />}
                    {active === 'volumes' && <Volumes />}
                </div>
            </div>
        </div>
    )
}
