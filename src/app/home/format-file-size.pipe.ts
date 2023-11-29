import { Pipe, PipeTransform } from "@angular/core"; 

const FILE_SIZE_INITS = [
    'B', 'KB', 'MB', 'GB', 'TB' 
];

const FILE_SIZE_UNITS_LONG = [
    'Bytes', 'KiloBytes', 'MegaBytes', 
    'GigaBytes', 'TeraBytes'
];

@Pipe({
    name: 'formatFileSize'
})

export class FormatFileSizePipe implements PipeTransform{
    transform(sizeInBytes: number,
    longForm: boolean): string{
        const units = longForm?FILE_SIZE_UNITS_LONG: FILE_SIZE_INITS;

        let power = Math.round(Math.log(sizeInBytes)/Math.log(1024));
        power = Math.min(power, units.length - 1);
        const size = sizeInBytes / Math.pow(1024,power);
        const formattedSize = Math.round(size*100)/100;
        const unit = units[power];
        return `${formattedSize} ${unit}`
    }

}