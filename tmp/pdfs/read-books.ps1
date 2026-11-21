param([int]$Level=3,[int]$Start=0,[int]$Count=8)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
$taskMethod=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
function Await($operation,$type){$task=$taskMethod.MakeGenericMethod($type).Invoke($null,@($operation));$task.Wait();$task.Result}
function AwaitAction($operation){$method=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and !$_.IsGenericMethod -and $_.GetParameters().Count -eq 1 }; $task=$method.Invoke($null,@($operation));$task.Wait()}
$paths=@('D:\01_GIANG DAY\2_HSK\HSK1\Giáo trình\HSK 1 3.0.pdf','D:\01_GIANG DAY\2_HSK\HSK2\Sách\HK2 3.0.pdf','D:\01_GIANG DAY\2_HSK\HSK3 （bản đẹp）\Giáo trình\HK3 3.0.pdf')
$file=Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($paths[$Level-1])) ([Windows.Storage.StorageFile])
$pdf=Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
Write-Output "HSK$Level pages: $($pdf.PageCount)"
for($i=$Start;$i -lt [Math]::Min($Start+$Count,$pdf.PageCount);$i++){
 $page=$pdf.GetPage($i);$stream=[Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
 $options=[Windows.Data.Pdf.PdfPageRenderOptions,Windows.Data.Pdf,ContentType=WindowsRuntime]::new();$options.DestinationWidth=1100
 AwaitAction ($page.RenderToStreamAsync($stream,$options))
 $input=[System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
 $output=[IO.File]::Create((Join-Path $PSScriptRoot "hsk$Level-page-$i.png"));$input.CopyTo($output);$output.Dispose();$input.Dispose();$stream.Dispose();$page.Dispose()
}
