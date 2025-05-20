import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2, ListPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/useDepartments";

interface DepartmentData {
  id: string;
  department: string;
  tagline: string;
  doctor_name: string;
  doctor_bio: string;
  link_text: string;
  link_url: string;
}

interface ServiceData {
  id: string;
  department: string;
  service: string;
}

export const DepartmentsEditor = () => {
  const { departments, departmentServices, refreshData } = useDepartments();
  const [activeTab, setActiveTab] = useState("departments");
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [currentDeptForServices, setCurrentDeptForServices] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Select first department for services tab
  useEffect(() => {
    if (departments.length > 0 && !currentDeptForServices) {
      setCurrentDeptForServices(departments[0].department);
    }
  }, [departments, currentDeptForServices]);

  const handleSelectDepartment = (dept: DepartmentData) => {
    setSelectedDept({...dept});
  };

  const handleAddNewDepartment = () => {
    setSelectedDept({
      id: 'new',
      department: '',
      tagline: '',
      doctor_name: '',
      doctor_bio: '',
      link_text: '',
      link_url: ''
    });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedDept) return;
    
    const { name, value } = e.target;
    setSelectedDept({
      ...selectedDept,
      [name]: value
    });
  };

  const handleSaveDepartment = async () => {
    if (!selectedDept) return;
    
    setLoading(true);
    try {
      // Check if new or update
      const isNewDept = !selectedDept.id || selectedDept.id === 'new';
      
      // Remove id for new departments
      const deptData = isNewDept 
        ? { 
            department: selectedDept.department,
            tagline: selectedDept.tagline,
            doctor_name: selectedDept.doctor_name,
            doctor_bio: selectedDept.doctor_bio,
            link_text: selectedDept.link_text,
            link_url: selectedDept.link_url
          }
        : selectedDept;
      
      const { error } = await supabase
        .from('csm_specialities_departments')
        .upsert(deptData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Department ${isNewDept ? 'created' : 'updated'} successfully`
      });
      
      refreshData();
      
      if (isNewDept) {
        setSelectedDept(null);
      }
    } catch (err) {
      console.error("Error saving department:", err);
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDept || !selectedDept.id || selectedDept.id === 'new') return;
    
    if (!confirm(`Are you sure you want to delete the ${selectedDept.department} department? This will also delete all associated services.`)) return;
    
    setLoading(true);
    try {
      // First delete all services for this department
      await supabase
        .from('csm_specialities_departments_services')
        .delete()
        .eq('department', selectedDept.department);
      
      // Then delete the department itself
      const { error } = await supabase
        .from('csm_specialities_departments')
        .delete()
        .eq('id', selectedDept.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Department deleted successfully"
      });
      
      refreshData();
      setSelectedDept(null);
    } catch (err) {
      console.error("Error deleting department:", err);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Service handlers
  const handleSelectService = (service: ServiceData) => {
    setSelectedService({...service});
  };

  const handleAddNewService = () => {
    if (!currentDeptForServices) {
      toast({
        title: "Error",
        description: "Please select a department first",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedService({
      id: 'new',
      department: currentDeptForServices,
      service: ''
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedService) return;
    
    const { name, value } = e.target;
    setSelectedService({
      ...selectedService,
      [name]: value
    });
  };

  const handleSaveService = async () => {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      // Check if new or update
      const isNewService = !selectedService.id || selectedService.id === 'new';
      
      // Remove id for new services
      const serviceData = isNewService
        ? { 
            department: selectedService.department,
            service: selectedService.service
          }
        : selectedService;
      
      const { error } = await supabase
        .from('csm_specialities_departments_services')
        .upsert(serviceData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Service ${isNewService ? 'created' : 'updated'} successfully`
      });
      
      refreshData();
      
      if (isNewService) {
        setSelectedService(null);
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService || !selectedService.id || selectedService.id === 'new') return;
    
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_specialities_departments_services')
        .delete()
        .eq('id', selectedService.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service deleted successfully"
      });
      
      refreshData();
      setSelectedService(null);
    } catch (err) {
      console.error("Error deleting service:", err);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="services">Department Services</TabsTrigger>
      </TabsList>
      
      <TabsContent value="departments">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Departments</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddNewDepartment}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
            
            {departments.length === 0 ? (
              <p className="text-gray-500">No departments found</p>
            ) : (
              <div className="space-y-2">
                {departments.map(dept => (
                  <div 
                    key={dept.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                      ${selectedDept?.id === dept.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                    onClick={() => handleSelectDepartment(dept)}
                  >
                    <div className="font-medium">{dept.department}</div>
                    <div className="text-xs text-gray-500">
                      {dept.tagline}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={refreshData}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="col-span-2 border rounded-lg p-6">
            {selectedDept ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="department">Department Name</Label>
                  <Input 
                    id="department"
                    name="department"
                    value={selectedDept.department}
                    onChange={handleDepartmentChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input 
                    id="tagline"
                    name="tagline"
                    value={selectedDept.tagline}
                    onChange={handleDepartmentChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor_name">Doctor Name</Label>
                  <Input 
                    id="doctor_name"
                    name="doctor_name"
                    value={selectedDept.doctor_name}
                    onChange={handleDepartmentChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor_bio">Doctor Bio</Label>
                  <Textarea 
                    id="doctor_bio"
                    name="doctor_bio"
                    value={selectedDept.doctor_bio}
                    onChange={handleDepartmentChange}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="link_text">Button Text</Label>
                  <Input 
                    id="link_text"
                    name="link_text"
                    value={selectedDept.link_text}
                    onChange={handleDepartmentChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="link_url">Button URL</Label>
                  <Input 
                    id="link_url"
                    name="link_url"
                    value={selectedDept.link_url}
                    onChange={handleDepartmentChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  {selectedDept.id && selectedDept.id !== 'new' && (
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteDepartment}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  
                  <div className="ml-auto">
                    <Button 
                      onClick={handleSaveDepartment}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a department to edit, or click "Add New"</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="services">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg p-4">
            <div className="mb-4">
              <Label htmlFor="currentDept">Select Department</Label>
              <select
                id="currentDept"
                className="w-full p-2 border rounded mt-1"
                value={currentDeptForServices}
                onChange={(e) => {
                  setCurrentDeptForServices(e.target.value);
                  setSelectedService(null);
                }}
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.department}>
                    {dept.department}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Services</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddNewService}
              >
                <ListPlus className="h-4 w-4 mr-1" />
                Add Service
              </Button>
            </div>
            
            {!currentDeptForServices ? (
              <p className="text-gray-500">Select a department first</p>
            ) : !departmentServices[currentDeptForServices] || departmentServices[currentDeptForServices].length === 0 ? (
              <p className="text-gray-500">No services for this department</p>
            ) : (
              <div className="space-y-2">
                {departmentServices[currentDeptForServices]?.map(service => (
                  <div 
                    key={service.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                      ${selectedService?.id === service.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                    onClick={() => handleSelectService(service)}
                  >
                    <div className="font-medium">{service.service}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={refreshData}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="col-span-2 border rounded-lg p-6">
            {selectedService ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department"
                    value={selectedService.department}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="service">Service Name</Label>
                  <Input 
                    id="service"
                    name="service"
                    value={selectedService.service}
                    onChange={handleServiceChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  {selectedService.id && selectedService.id !== 'new' && (
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteService}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  
                  <div className="ml-auto">
                    <Button 
                      onClick={handleSaveService}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a service to edit, or click "Add Service"</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
