
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Save, FilePlus, Calendar, FolderTree, DollarSign, Download } from 'lucide-react';
import ReportForm from '@/components/ReportForm';
import { CollectionItem, TimeRange } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { exportCollectionToExcel } from '@/utils/excelExport';

type ReportData = {
  name: string;
  type: 'time' | 'category';
  timeRange?: TimeRange;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  items: CollectionItem[];
  totalValue: number;
};

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { collectionItems, categories, getCategoryById } = useData();
  const { toast } = useToast();
  
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  
  const handleGenerateReport = (data: any) => {
    const { name, type, startDate, endDate, categoryId } = data;
    
    let filteredItems: CollectionItem[] = [];
    
    if (type === 'time' && startDate && endDate) {
      filteredItems = collectionItems.filter(item => {
        const itemDate = new Date(item.acquisitionDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (type === 'category' && categoryId) {
      filteredItems = collectionItems.filter(item => item.categoryId === categoryId);
    }
    
    const totalValue = filteredItems.reduce((sum, item) => sum + item.price, 0);
    
    setReport({
      name,
      type,
      startDate,
      endDate,
      categoryId,
      items: filteredItems,
      totalValue,
    });
    
    setIsGenerateDialogOpen(false);
    
    if (filteredItems.length === 0) {
      toast({
        title: 'No items found',
        description: 'No items match the criteria for this report.',
      });
    }
  };
  
  const handleSaveReport = () => {
    // In a real app, this would save the report to the database
    toast({
      title: 'Report saved',
      description: 'The report has been saved successfully.',
    });
  };
  
  const handleExportExcel = () => {
    if (!report) return;
    
    try {
      exportCollectionToExcel(
        report.items, 
        categories, 
        { 
          fileName: `${report.name.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}`,
          sheetName: report.name
        }
      );
      
      toast({
        title: 'Export successful',
        description: 'The report has been exported to Excel.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the report.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate reports on your collection
          </p>
        </header>

        <div className="flex justify-end">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePlus className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Create a new report based on time period or category.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ReportForm onGenerate={handleGenerateReport} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!report ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No active report</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Generate a report to view statistics about your collection
            </p>
            <Button onClick={() => setIsGenerateDialogOpen(true)}>
              <FilePlus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{report.name}</CardTitle>
                    <CardDescription>
                      {report.type === 'time' ? (
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {report.startDate && report.endDate ? (
                            <>
                              {format(report.startDate, 'MMM d, yyyy')} - {format(report.endDate, 'MMM d, yyyy')}
                            </>
                          ) : (
                            'Time period report'
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center mt-1">
                          <FolderTree className="h-4 w-4 mr-1" />
                          {report.categoryId ? (
                            getCategoryById(report.categoryId)?.name || 'Category'
                          ) : (
                            'Category report'
                          )}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleSaveReport}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                      <Download className="h-4 w-4 mr-1" />
                      Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrintReport}>
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{report.items.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${report.totalValue.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${report.items.length > 0 
                          ? (report.totalValue / report.items.length).toFixed(2) 
                          : '0.00'
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {report.items.length > 0 ? (
                  <div className="border rounded-md">
                    <div className="bg-muted/50 p-3 font-medium border-b">
                      <div className="grid grid-cols-5 gap-4">
                        <div>Item Name</div>
                        <div>Category</div>
                        <div>Condition</div>
                        <div>Date Acquired</div>
                        <div className="text-right">Value</div>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="p-1">
                        {report.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="grid grid-cols-5 gap-4 py-3 px-2 border-b last:border-0 hover:bg-muted/20"
                          >
                            <div className="font-medium">{item.name}</div>
                            <div>{item.categoryName}</div>
                            <div>{item.condition.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}</div>
                            <div>{format(new Date(item.acquisitionDate), 'MMM d, yyyy')}</div>
                            <div className="text-right">${item.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">
                      No items match the criteria for this report.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="text-sm text-muted-foreground">
                  Report generated for {user?.name} on {format(new Date(), 'MMMM d, yyyy')}
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
