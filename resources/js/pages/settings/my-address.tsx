
export default function MyAddress() {
    return(
        <div className="">
            <h1 className="text-2xl font-bold mb-4">Mis Direcciones</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <form action="" method="POST">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="col-span-1 sm:col-span-2">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre*</label>
                            <input type="text" name="nombre" id="nombre" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        {/* Add other fields here */}
                    </div>
                    <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Guardar</button>
                </form>
            </div>
        </div>
    );
}